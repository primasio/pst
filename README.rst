Primas ERC20 Token
==================

:Date: 08/15 2017

.. contents::


设计目的
-------

在Primas系统正式上线前，使用此ERC20 Token实现PST的交易功能。在Primas系统正式上线后，此合约将被终止使用。


合约功能需求说明
--------------

1. 符合ERC20代币标准
2. 可接收转账；
3. 可向任意地址发起转账；
4. 合约部署方可以终止此合约的使用；
5. 合约部署方可以锁定任意账号，在一段时间内禁止其转账功能，也可以随时解锁任意账号；

其中4、5只能由合约部署方执行。


转账工作流程
-----------

1. 调用transfer()方法，完成向指定账号的转账。
2. 调用approve()方法，授权spender操作本账号内的指定数量的Token，再由spender调用transferFrom方法，完成向指定账号的转账。


账号锁定工作流程
--------------

1. 合约部署方调用catchYou()方法，指定账号和解锁时间，对某一个账号进行锁定。锁定中的账号无法进行转账、授权和接收转账的操作。
2. 合约部署方可通过调用catchYou()方法随时更新解锁时间，将解锁时间修改为历史时间可立即完成对账号的解锁。


终止合约工作流程
--------------

1. 合约部署方调用enableTransfers()方法，传入false参数停用本合约，停用后所有转账功能全部禁止。
2. 合约部署方调用enableTransfers()方法，传入true参数可重新启用本合约。


合约部署
-------

**macOS**:

.. code:: bash

    brew tap ethereum/ethereum
    brew install solidity
    brew install node
    brew install npm

    npm install -d
    python2 solidity.py
    node src/deploy.js



**Ubuntu**:

.. code:: bash

    sudo add-apt-repository ppa:ethereum/ethereum
    sudo apt update -y
    sudo apt install solc nodejs npm
    sudo ln -s /usr/bin/nodejs /usr/bin/node

    npm install -d
    python2 solidity.py
    node src/deploy.js
