import MPEContract from "singularitynet-platform-contracts/networks/MultiPartyEscrow";
import Web3 from "web3";

const web3 = new Web3("wss://ropsten.infura.io/ws/v3/ee6afbd4f6fe42e78b68eec31660ec78", null, {});


const generateSignature = async () => {
    const privateKey = "5d66dccb32b03871f30533fe410d2e5998d607a579fb7bc2d991cd2148e3ec67"
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const address = account.address;
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = address;
    // const recipient = groupInfo.payment.payment_address;
    // const hexGroupId = decodeGroupId(groupInfo.group_id);
    // const amountInCogs = USDToCogs(amount);
    // const currentBlockNumber = await web3.eth.getBlockNumber();
    const currentBlockNumber = 9419717
    const mpeContractAddress = web3.utils.toChecksumAddress(MPEContract[3].address);
    // block no is mined in 15 sec on average, setting expiration as 10 years
    // const expiration = currentBlockNumber + tenYearBlockOffset;
    const channelId = 2142
    const sha3Message = web3.utils.soliditySha3(
      { t: "string", v: "__get_channel_state" },
      { t: "address", v: mpeContractAddress },
      { t: "uint256", v: channelId },
      { t: "uint256", v: currentBlockNumber },
    );
    const { signature } = await web3.eth.accounts.sign(sha3Message, privateKey);
    console.log({ signature, address, currentBlockNumber })
    const APISignature = "0x9467fda6c3c4f0c666bce89b724b91ac10824e42f042edfbf3d342f81467a0a429e4849feec84b46855e2b0ac3aa58cedef6d833ffb3f8063d6d1b16c2d0e9dc1b"
    console.log(`The APISignature is ${signature === APISignature ? "SAME" : "NOT same"} as the generated signature`)
    return Promise.resolve({ signature, address, currentBlockNumber });
  };

  generateSignature()

