const ethers = require("ethers");

// Providers for different networks
const urlxDAIProvider = "https://rpc.gnosischain.com";
const urlMainetProvider = "https://rpc.ankr.com/eth";
const urlOptimismProvider = "https://mainnet.optimism.io";
const urlPolygonzkEVMProvider = "https://rpc.ankr.com/polygon_zkevm";
const urlPolygonzkEVMProvider = "TBD";

// ABI files
const TokenArtifact = require("./abi/GIV.json");
const BridgedTokenArtifact = require("./abi/GIV-Bridged-L2.json");

// Token addresses
const Token = "0x900db999074d9277c5da2a43f252d74366230da0";
const Token_xDAI = "0x4f4F9b8D5B4d0Dc10506e5551B0513B61fD59e75";
const Token_optimism = '0x528CDc92eAB044E1E39FE43B9514bfdAB4412B98';
const Token_polygonzkEVM = '0xddafb91475bbf6210a151fa911ac8fda7de46ec2'
const Token_Solana = '3Xi3EhKjnKAk2KTChzybUSWcLW6eAgTHyotHH1U6sJE1';

// Smart contract addresses to exclude from circulating supply
const mainnet_sc = [
    "0x87dE995F6744B75bBe0255A973081142aDb61f4d", // Token Distro
    "0xf924fF0f192f0c7c073161e0d62CE7635114e74f", // Liquidity Safe
    "0x0018C6413BFE5430ff9ba4bD7ac3B6AA89BEBD9b", // nrGIV Multisig
    "0x2B0ee142dCFE7C2dD150cDbd7B6832F6e9977f51", // OneGIV Liquidity Multisig
    "0xd10BAC02a02747cB293972f99981F4Faf78E1626", // GIVgarden Multisig
    "0x88ad09518695c6c3712ac10a214be5109a655671", // Gnosis OmniBridge
    "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1", // Optimism Gateway
    "0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe", // Polygon ZKEVM Bridge
];

const xdai_sc = [
    "0xc0dbDcA66a0636236fAbe1B3C16B1bD4C84bB1E1", // Token Distro
    "0xf924fF0f192f0c7c073161e0d62CE7635114e74f", // Liquidity Safe
    "0xe70494225312c6b1167c15134dab66730f36708d", // rGIV Multisig
    "0x0018C6413BFE5430ff9ba4bD7ac3B6AA89BEBD9b", // nrGIV multisig
    "0xf4ef9a155dd268e321afa7b9391e0602a7b09588", // Old GIVgarden 
    "0xd10BAC02a02747cB293972f99981F4Faf78E1626", // New GIVgarden Multisig Wallet
];

const optimism_sc = [
    "0xE3Ac7b3e6B4065f4765d76fDC215606483BF3bD1", // Token Distro
    "0xf924fF0f192f0c7c073161e0d62CE7635114e74f", // Liquidity Safe
    "0x0018C6413BFE5430ff9ba4bD7ac3B6AA89BEBD9b", // nrGIV multisig
    "0xd10BAC02a02747cB293972f99981F4Faf78E1626", // GIV Garden Multisig
    "0x1D68124e65faFC907325e3EDbF8c4d84499DAa8b", // Solana Bridge Gateway

];

const PolygonzkEVM_sc = [
    "0x4fB9B10ECDe1b048DBC79aBEAB3793edc93a0d54", // Token Distro
    "0xf924fF0f192f0c7c073161e0d62CE7635114e74f", // Liquidity Safe
    "0x0018C6413BFE5430ff9ba4bD7ac3B6AA89BEBD9b", // rGIV Multisig
    "0xa1769a425EA1197f32d8C3e0fbE3F92EaDACC21A", // Alternative Multisig liquidity

const Solana_sc = [
    "8xfvWSffnXdEK5LSPAUVHckxmBCTVAB3iJm4pxN9sJxf", // Multisig Liquidity Solana
  ];  

// Function to calculate token supply
async function calculateTokenSupplyCMC(query) {
    const mainnetProvider = new ethers.providers.JsonRpcProvider(urlMainetProvider);
    const xDAIProvider = new ethers.providers.JsonRpcProvider(urlxDAIProvider);
    const optimismProvider = new ethers.providers.JsonRpcProvider(urlOptimismProvider);
    const polygonzkEVMProvider = new ethers.providers.JsonRpcProvider(urlPolygonzkEVMProvider);

    const token = new ethers.Contract(Token, TokenArtifact.abi, mainnetProvider); // Use .abi for GIV.json
    const token_xdai = new ethers.Contract(Token_xDAI, TokenArtifact.abi, xDAIProvider); // Use .abi for GIV.json
    const token_optimism = new ethers.Contract(Token_optimism, BridgedTokenArtifact, optimismProvider); // Use the array directly for GIV-Bridged-L2.json
    const token_polygonzkEVM = new ethers.Contract(Token_polygonzkEVM, BridgedTokenArtifact, polygonzkEVMProvider); // Use the array directly for GIV-Bridged-L2.json

    const totalSupply = await token.totalSupply();
    let circulating_supply = totalSupply;

    const mainnet_sc_promises = mainnet_sc.map(item => token.balanceOf(item));
    const xdai_sc_promises = xdai_sc.map(item => token_xdai.balanceOf(item));
    const optimism_sc_promises = optimism_sc.map(item => token_optimism.balanceOf(item));
    const polygonzkEVM_sc_promises = PolygonzkEVM_sc.map(item => token_polygonzkEVM.balanceOf(item));

    const mainnet_values = await Promise.all(mainnet_sc_promises);
    mainnet_values.forEach(value => {
        circulating_supply = circulating_supply.sub(value);
    });

    const xdai_values = await Promise.all(xdai_sc_promises);
    xdai_values.forEach(value => {
        circulating_supply = circulating_supply.sub(value);
    });

    const optimism_values = await Promise.all(optimism_sc_promises);
    optimism_values.forEach(value => {
        circulating_supply = circulating_supply.sub(value);
    });

    const polygonzkEVM_values = await Promise.all(polygonzkEVM_sc_promises);
    polygonzkEVM_values.forEach(value => {
      circulating_supply = circulating_supply.sub(value);
    });

    if (query === "totalcoins") {
        return totalSupply * Math.pow(10, -18);
    }

    if (query === "circulating") {
        return circulating_supply * Math.pow(10, -18);
    }

    return "invalid input";
}

module.exports = { calculateTokenSupplyCMC };
