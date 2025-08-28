import os
import torch
from transformers import BertTokenizer, BertForSequenceClassification

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Go 4 levels up → project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
MODEL_PATH = os.path.join(BASE_DIR, "models", "bert_model")

# Load tokenizer & model
tokenizer = BertTokenizer.from_pretrained(MODEL_PATH)
model = BertForSequenceClassification.from_pretrained(MODEL_PATH)
model.to(device)
model.eval()

def predict_rating(review_text: str) -> int:
    inputs = tokenizer(
        review_text,
        max_length=200,
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )
    input_ids = inputs["input_ids"].to(device)
    attention_mask = inputs["attention_mask"].to(device)

    with torch.no_grad():
        outputs = model(input_ids, attention_mask=attention_mask)
        preds = torch.argmax(outputs.logits, dim=1).item()

    return preds + 1  # since labels start from 0
