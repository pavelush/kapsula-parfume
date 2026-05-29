"""
RMBG-2.0 Background Removal Microservice
=========================================
Lightweight Flask service that loads the RMBG-2.0 model once at startup
and exposes an HTTP endpoint for background removal.

Runs on localhost:5001, managed by PM2 alongside the Node.js backend.
"""

import os
import io
import sys
import logging
from flask import Flask, request, send_file, jsonify

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# ── HuggingFace token (required for gated RMBG-2.0 model) ───────────────────
HF_TOKEN = os.environ.get('HF_TOKEN')
if not HF_TOKEN:
    logger.error("HF_TOKEN environment variable is not set! RMBG-2.0 is a gated model and requires authentication.")
    sys.exit(1)

# ── Load model at startup ────────────────────────────────────────────────────
logger.info("Loading RMBG-2.0 model (first time will download ~200 MB)...")

import torch
from torchvision import transforms
from transformers import AutoModelForImageSegmentation
from PIL import Image
import numpy as np
from huggingface_hub import login

# Authenticate with HuggingFace
login(token=HF_TOKEN)

# Load the model
model = AutoModelForImageSegmentation.from_pretrained(
    "briaai/RMBG-2.0",
    trust_remote_code=True,
    torch_dtype=torch.bfloat16
)
model.eval()

# Move to CPU explicitly
device = torch.device('cpu')
model.to(device)

logger.info("RMBG-2.0 model loaded successfully in bfloat16!")

# ── Image preprocessing ─────────────────────────────────────────────────────
transform_pipeline = transforms.Compose([
    transforms.Resize((1024, 1024)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ── Flask app ────────────────────────────────────────────────────────────────
app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "model": "RMBG-2.0"})


@app.route('/remove-bg', methods=['POST'])
def remove_bg():
    """
    Remove background from an uploaded image.
    Expects: multipart/form-data with field 'image'
    Returns: PNG image with transparent background
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    
    try:
        # Open and convert image
        image = Image.open(file.stream).convert("RGB")
        original_size = image.size
        
        logger.info(f"Processing image: {original_size[0]}x{original_size[1]}")
        
        # Preprocess (convert tensor to bfloat16)
        input_tensor = transform_pipeline(image).unsqueeze(0).to(device, dtype=torch.bfloat16)
        
        # Inference
        with torch.no_grad():
            preds = model(input_tensor)[-1].sigmoid().to(torch.float32)
        
        # Post-process: resize mask back to original image size
        mask = preds[0].squeeze()
        mask = transforms.functional.resize(
            mask.unsqueeze(0),
            original_size[::-1],  # (height, width)
            interpolation=transforms.InterpolationMode.BILINEAR
        ).squeeze()
        
        # Convert mask to 0-255 range
        mask_np = (mask * 255).byte().cpu().numpy()
        
        # Apply mask as alpha channel
        result = image.copy()
        result.putalpha(Image.fromarray(mask_np))
        
        # Save to buffer
        output_buffer = io.BytesIO()
        result.save(output_buffer, format='PNG', optimize=True)
        output_buffer.seek(0)
        
        logger.info(f"Background removed successfully")
        
        return send_file(
            output_buffer,
            mimetype='image/png',
            as_attachment=False
        )
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        return jsonify({"error": f"Failed to process image: {str(e)}"}), 500


if __name__ == '__main__':
    port = int(os.environ.get('RMBG_PORT', 5001))
    logger.info(f"Starting RMBG-2.0 service on port {port}...")
    app.run(host='127.0.0.1', port=port, threaded=True)
