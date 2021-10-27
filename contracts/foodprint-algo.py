#pragma version 2

from pyteal import *

def approval_program():
    pass

def close_out_program():
    pass

# Compile the Pyteal code and write Teal opcode to a file.
with open('foodprint-algo.teal', 'w') as f:
    # compileTeal() function used to compile pyteal expressions into TEAL assembly code
    compiled = compileTeal(approval_program(), Mode.Application)
    f.write(compiled)