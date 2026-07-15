import psutil
import os

process = psutil.Process(os.getpid())


def log_mem(stage):
    mem = process.memory_info().rss / 1024 / 1024
    print(f"[MEM] {stage}: {mem:.1f} MB")
