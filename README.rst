Primas ICO Token
====================

:Date: 07/03 2017

.. contents::


Deploy
-----------

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
    
