"""SİTEY-VM Demo - Güvenlik modülü (JWT + bcrypt)"""
import os
import uuid
import hashlib
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import bcrypt

def _generate_machine_secret():
    """Makineye özgü deterministik ama tahmin edilemez secret key üret."""
    import platform
    seed = f"{platform.node()}-{os.path.abspath(__file__)}-siteyvm-demo-2025"
    return hashlib.sha256(seed.encode()).hexdigest()

SECRET_KEY = os.environ.get("SITEYVM_SECRET_KEY", _generate_machine_secret())
ALGORITHM = "HS256"


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=24))
    to_encode.update({"exp": expire, "jti": str(uuid.uuid4())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
