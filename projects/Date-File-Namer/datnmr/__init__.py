import argparse
import os
import sys
import datetime
from dataclasses import dataclass


@dataclass
class Args:
	PATH: str | None = None
	recursive: bool | None = None

def cleanRaise(err: Exception) -> None:
	sys.tracebacklimit = 0
	raise err

def main() -> None:
	parser = argparse.ArgumentParser(description='name FILE(s) by their date', epilog="""-f --format uses the time.strftime directive. here are all the format codes:
""")

	parser.add_argument('PATH')
	parser.add_argument('-r', '--recursive', action='store_true', help='recursives into PATH')
	parser.add_argument('-f', '--format', help='date format for renaming PATH. default "%y%m%d". see epilog for more infos', default='%Y%m%d')

	args = parser.parse_args(namespace=Args(None, None))

	if not args.PATH or not os.path.exists(args.PATH):
		sys.tracebacklimit = 0
		raise FileNotFoundError(f'{args.PATH}: directory not found')

	print(time.localtime(os.path.getctime(args.PATH)))

