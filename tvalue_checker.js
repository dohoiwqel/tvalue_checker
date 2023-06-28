import Web3 from 'web3'
import Moralis from 'moralis'
import * as readline from 'readline'
import * as fs from 'fs'

async function read(fileName) {
    const array = []
    const readInterface = readline.createInterface({
        input: fs.createReadStream(fileName),
        crlfDelay: Infinity,
    })
    for await (const line of readInterface) {
        array.push(line)
    }
    return array
}

async function getAllShards(nftAddress, userAddress) {
    try {
        const response = await Moralis.EvmApi.nft.getWalletNFTs({
            "chain": "0x1",
            "format": "decimal",
            "tokenAddresses": [
                nftAddress
            ],
            "mediaItems": false,
            "address": userAddress
        });
        return response.raw
    } catch (e) {
        console.error(e);
    }
}

async function getAllMini(userAddress) {
    const web3 = new Web3('https://rpc.ankr.com/bsc')
    const contractAddress = '0x1bC274C3b3b24ceF54d01AEEB9fFc73Ac0b68936'
    const contract = new web3.eth.Contract([{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}], contractAddress)
    return Number(await contract.methods.balanceOf(userAddress, 1).call())
}

async function main() {
    
    await Moralis.start({apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6Ijg4ODBkNGY3LTMwNWQtNDZlYi05MjEzLWY4YjlkODRlMWI0MCIsIm9yZ0lkIjoiMzQ1NjU3IiwidXNlcklkIjoiMzU1MzIwIiwidHlwZUlkIjoiMzQwM2RjZTYtZjY5NS00OGExLWFlNzEtNDY2YzE5ZmI4YWI1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODc5MTAzMjgsImV4cCI6NDg0MzY3MDMyOH0.AC9hkbrlm3uaLzsc6H6_vhva2gws4JUgXzWL63EWPQY"});
    const wallets = await read('wallets.txt')
    
    for(let wallet of wallets) {
        let shardValue = 0
        let response = await getAllShards('0xD9c225efCC4162173a7369A14fD559dE4e4AAdAE', wallet)
        for(let i of response.result) {
            const tvalue = Number(JSON.parse(i.metadata).attributes[1].value)
            shardValue += tvalue
        }

        let miniShardValue = await getAllMini(wallet)
        console.log(`${wallet}: ShardValue: ${shardValue} MiniShardValue: ${miniShardValue} Total: ${shardValue + miniShardValue}`)
    }
}

main()