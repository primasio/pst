#!/usr/bin/env python
#coding: utf8

import os, sys, json

# Solc Compiler
SOLC = "solc"

BASE_PATH = os.path.dirname(os.path.abspath(__file__))

src_dir = os.path.join(BASE_PATH, "src")
dst_dir = os.path.join(BASE_PATH, "build")
dst_tmp = os.path.join(BASE_PATH, "build/src")

bin_dir = os.path.join(BASE_PATH, "build/bin")
abi_dir = os.path.join(BASE_PATH, "build/abi")
ast_dir = os.path.join(BASE_PATH, "build/ast")

src_entry    = os.path.join(src_dir, "main.sol")
build_target = os.path.join(BASE_PATH, "build/contract.json")

def rmdir(path):
    for root, dirs, files in os.walk(path, topdown=False):
        for name in files:
            os.remove(os.path.join(root, name))
        for name in dirs:
            os.rmdir(os.path.join(root, name))
    os.rmdir(path)

def diff_path():
    if not os.path.exists(dst_dir):
        os.mkdir(dst_dir)
    if not os.path.exists(dst_tmp):
        os.mkdir(dst_tmp)
    if not os.path.exists(bin_dir):
        os.mkdir(bin_dir)
    if not os.path.exists(abi_dir):
        os.mkdir(abi_dir)
    if not os.path.exists(ast_dir):
        os.mkdir(ast_dir)

    assert(os.path.exists(src_dir) and os.path.isdir(src_dir) )
    assert(os.path.exists(dst_dir) and os.path.isdir(dst_dir) )
    assert(os.path.exists(dst_tmp) and os.path.isdir(dst_tmp) )

    assert(os.path.exists(bin_dir) and os.path.isdir(bin_dir) )
    assert(os.path.exists(abi_dir) and os.path.isdir(abi_dir) )
    assert(os.path.exists(ast_dir) and os.path.isdir(ast_dir) )

    src_paths = map(lambda (root, dirs, files): root.replace(src_dir, ""), os.walk(src_dir) )
    dst_paths = map(lambda (root, dirs, files): root.replace(dst_tmp, ""), os.walk(dst_tmp) )
    _paths = filter(lambda p: p not in src_paths, dst_paths)
    paths = map(lambda p: os.path.join(dst_tmp, p[1:] if p.startswith("/") else p ), _paths )    
    map(lambda p: rmdir(p), paths )

    _paths = filter(lambda p: p not in dst_paths, src_paths)
    paths = map(lambda p: os.path.join(dst_tmp, p[1:] if p.startswith("/") else p ), _paths )
    map(lambda p: os.mkdir(p), paths)

def clean_dst_path():
    if os.path.exists(dst_dir):
        rmdir(dst_dir)
    os.mkdir(dst_dir)

def find_compilers():
    paths = os.environ["PATH"].split(":")
    solc = filter(lambda p: os.path.exists(os.path.join(p, "solc")) and os.path.isfile(os.path.join(p, "solc")), paths)
    # os.path.exists(os.path.join(p, "solcjs")) and os.path.isfile(os.path.join(p, "solcjs"))
    serpent = filter(lambda p: os.path.exists(os.path.join(p, "serpent")) and os.path.isfile(os.path.join(p, "serpent")), paths)
    lllc    = filter(lambda p: os.path.exists(os.path.join(p, "lllc")) and os.path.isfile(os.path.join(p, "lllc")), paths)

    result = []
    if len(solc) > 0:
        result.append("Solidity")
    if len(serpent) > 0:
        result.append("Serpent")
    if len(lllc) > 0:
        result.append("LLL")
    return result

def complie_soldity():
    """
        solc --optimize --bin -o ./build/bin contract.sol
        solc --optimize --ast -o ./build/ast contract.sol
        solc --optimize --abi -o ./build contract.sol
    """
    assert(os.path.exists(src_entry) and os.path.isfile(src_entry) )

    commands = [
          [SOLC, "--optimize", "--bin", "--overwrite", "-o", os.path.relpath(bin_dir), os.path.relpath(src_entry) ]
        , [SOLC, "--optimize", "--ast", "--overwrite", "-o", os.path.relpath(ast_dir), os.path.relpath(src_entry) ]
        , [SOLC, "--optimize", "--abi", "--overwrite", "-o", os.path.relpath(dst_dir), os.path.relpath(src_entry) ]
    ]
    # commands = [
    #       [SOLC, "--optimize", "--bin", "-o", bin_dir, os.path.relpath(src_entry) ]
    #     , [SOLC, "--optimize", "--ast", "-o", ast_dir, os.path.relpath(src_entry) ]
    #     , [SOLC, "--optimize", "--abi", "-o", dst_dir, os.path.relpath(src_entry) ]
    # ]

    print("======================Complie Solidity Language=========================")
    for cmd in commands:
        command = " ".join(cmd)
        print(command)
        os.system(command)
    
    os.system("cp %s/* %s" %(bin_dir, dst_dir))

    # result = map(lambda cmd: os.system(" ".join(cmd)), commands )
    # print(result)

def restruct():
    contract = {}

    bin_files = reduce(lambda a, (root, dirs, files): a + map(lambda filename: os.path.join(root, filename), files ), os.walk(bin_dir), [] )
    abi_files = reduce(lambda a, (root, dirs, files): a + map(lambda filename: os.path.join(root, filename), files ), os.walk(dst_tmp), [] )
    ast_files = reduce(lambda a, (root, dirs, files): a + map(lambda filename: os.path.join(root, filename), files ), os.walk(ast_dir), [] )

    def path_handle(data, filepath):
        _, filename = os.path.split(filepath)
        assert(filename.endswith(".bin") or filename.endswith(".abi") )
        if filename.endswith(".bin"):
            key = "code"
        elif filename.endswith(".abi"):
            key = "interface"
        else:
            pass

        object_name = filename[:-4]
        _tmp = object_name.split(":")
        if len(_tmp) > 1:
            object_name = _tmp[-1]

        if object_name not in data or type(data[object_name]) != dict:
            data[object_name] = {}
        if key not in data[object_name]:
            res = open(filepath, "rb").read()
            if key == "interface":
                open(os.path.join(abi_dir, object_name+".abi"), "wb").write(res)
                data[object_name][key] = json.loads(res)
            elif key == "code":
                res = "0x" + res
                data[object_name][key] = res
            else:
                data[object_name][key] = res
        
        return data

    data = reduce(path_handle, abi_files, reduce(path_handle, bin_files, {}) )

    print("======================Contract=========================")
    output = json.dumps(data)
    open(build_target, "wb").write(output)
    print(output)

def usage():
    message = """
        $ python solidity.py -src ./src -entry main.sol -out ./build -target contract.json

            -src    solidity source dir
            -entry  source entry file
            -out    output dir
            -target solidity bytecode and interface file (JSON Format)
            --help  show this help text
    """
    print(message)

def main():
    compilers = find_compilers()
    print("====================Compilers====================")
    print(compilers)
    assert("Solidity" in compilers)
    
    clean_dst_path()
    diff_path()
    complie_soldity()
    restruct()
    os.system("ls -lah build/")

if __name__ == '__main__':
    main()
