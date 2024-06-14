import injectedModule from '@web3-onboard/injected-wallets'
import coinbaseWalletModule from '@web3-onboard/coinbase'
import metamaskSDK from '@web3-onboard/metamask'
import phantomModule from '@web3-onboard/phantom'
import tahoWalletModule from '@web3-onboard/taho'
import web3authModule from '@web3-onboard/web3auth'

import { init } from '@web3-onboard/react'

// Example key • Replace with your infura key
const PROVIDER_KEY = process.env.ALCHEMY_KEY ?? ''

const injected = injectedModule()
const web3Auth = web3authModule({
  clientId: process.env.WEB3_AUTH_CLIENT_ID ?? ''
})

const metamask = metamaskSDK({
  options: {
    extensionOnly: false,
    dappMetadata: {
      name: 'Monadex',
      iconUrl: '<svg fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>Ethereum icon</title><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/></svg>'
    }
  }
})
const phantom = phantomModule()
const taho = tahoWalletModule()
const coinbase = coinbaseWalletModule()

export default init({
  // An array of wallet modules that you would like to be presented to the user to select from when connecting a wallet.
  wallets: [
    injected,
    web3Auth,
    // metamask,
    phantom,
    taho,
    coinbase
  ],

  // An array of Chains that your app supports
  chains: [
    {
      id: 84532 ,
      token: 'ETH',
      label: 'BASE ETH Sepolia',
      rpcUrl: `https://base-sepolia.g.alchemy.com/v2/${PROVIDER_KEY}`,
      icon: '<svg fill="#000000" width="800px" height="800px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><title>Ethereum icon</title><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/></svg>'
    },
    // TODO: Remove for production
    {
      id: 31337,
      token: 'MND',
      label: 'Local Foundry',
      rpcUrl: 'http://127.0.0.1:8545'
    }
  ],
  theme: {
    "--w3o-background-color": "#2D0186",
    "--w3o-foreground-color": "#2E008B", 
    "--w3o-text-color": "white",
    "--w3o-border-color": "#a280ff", 
    "--w3o-action-color": "#8133FF", 
    "--w3o-border-radius": "10px",
    "--w3o-font-family": "unset"  
  },

  appMetadata: {
    name: 'Monadex',
    icon: '<svg width="700" height="155" viewBox="0 0 700 155" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.10468 82.7113C-4.29563 21.4033 79.5947 -1.314 105.868 54.3416C110.738 64.658 112.111 75.414 110.664 85.5405C107.752 80.1219 103.749 75.1827 98.8344 70.9534C93.3551 66.238 86.8503 62.4974 79.6914 59.9454C72.5324 57.3934 64.8594 56.0799 57.1106 56.0799C49.3618 56.0799 41.6889 57.3934 34.5299 59.9454C27.3709 62.4974 20.8661 66.238 15.3869 70.9534C9.90764 75.6689 5.56128 81.267 2.59593 87.4281C2.38169 87.8732 2.17496 88.3206 1.97577 88.7702C1.57825 86.789 1.2858 84.7675 1.10468 82.7113ZM9.11967 106.861L57.1106 106.861L102.907 106.861C93.3994 122.234 76.4685 133 56.0177 133C36.3235 133 18.8791 122.628 9.11967 106.861Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M1.10468 82.7113C-4.29563 21.4033 79.5947 -1.314 105.868 54.3416C110.738 64.658 112.111 75.414 110.664 85.5405C107.752 80.1219 103.749 75.1827 98.8344 70.9534C93.3551 66.238 86.8503 62.4974 79.6914 59.9454C72.5324 57.3934 64.8594 56.0799 57.1106 56.0799C49.3618 56.0799 41.6889 57.3934 34.5299 59.9454C27.3709 62.4974 20.8661 66.238 15.3869 70.9534C9.90764 75.6689 5.56128 81.267 2.59593 87.4281C2.38169 87.8732 2.17496 88.3206 1.97577 88.7702C1.57825 86.789 1.2858 84.7675 1.10468 82.7113ZM9.11967 106.861L57.1106 106.861L102.907 106.861C93.3994 122.234 76.4685 133 56.0177 133C36.3235 133 18.8791 122.628 9.11967 106.861Z" fill="white"/><path d="M144.227 30.9091H161.273L190.909 103.273H192L221.636 30.9091H238.682V124H225.318V56.6364H224.455L197 123.864H185.909L158.455 56.5909H157.591V124H144.227V30.9091ZM287.42 125.409C280.875 125.409 275.163 123.909 270.284 120.909C265.405 117.909 261.617 113.712 258.92 108.318C256.223 102.924 254.875 96.6212 254.875 89.4091C254.875 82.1667 256.223 75.8333 258.92 70.4091C261.617 64.9848 265.405 60.7727 270.284 57.7727C275.163 54.7727 280.875 53.2727 287.42 53.2727C293.966 53.2727 299.678 54.7727 304.557 57.7727C309.436 60.7727 313.223 64.9848 315.92 70.4091C318.617 75.8333 319.966 82.1667 319.966 89.4091C319.966 96.6212 318.617 102.924 315.92 108.318C313.223 113.712 309.436 117.909 304.557 120.909C299.678 123.909 293.966 125.409 287.42 125.409ZM287.466 114C291.708 114 295.223 112.879 298.011 110.636C300.799 108.394 302.86 105.409 304.193 101.682C305.557 97.9545 306.239 93.8485 306.239 89.3636C306.239 84.9091 305.557 80.8182 304.193 77.0909C302.86 73.3333 300.799 70.3182 298.011 68.0455C295.223 65.7727 291.708 64.6364 287.466 64.6364C283.193 64.6364 279.648 65.7727 276.83 68.0455C274.042 70.3182 271.966 73.3333 270.602 77.0909C269.269 80.8182 268.602 84.9091 268.602 89.3636C268.602 93.8485 269.269 97.9545 270.602 101.682C271.966 105.409 274.042 108.394 276.83 110.636C279.648 112.879 283.193 114 287.466 114ZM348.727 82.5455V124H335.136V54.1818H348.182V65.5455H349.045C350.652 61.8485 353.167 58.8788 356.591 56.6364C360.045 54.3939 364.394 53.2727 369.636 53.2727C374.394 53.2727 378.561 54.2727 382.136 56.2727C385.712 58.2424 388.485 61.1818 390.455 65.0909C392.424 69 393.409 73.8333 393.409 79.5909V124H379.818V81.2273C379.818 76.1667 378.5 72.2121 375.864 69.3636C373.227 66.4848 369.606 65.0455 365 65.0455C361.848 65.0455 359.045 65.7273 356.591 67.0909C354.167 68.4545 352.242 70.4545 350.818 73.0909C349.424 75.697 348.727 78.8485 348.727 82.5455ZM431.955 125.545C427.53 125.545 423.53 124.727 419.955 123.091C416.379 121.424 413.545 119.015 411.455 115.864C409.394 112.712 408.364 108.848 408.364 104.273C408.364 100.333 409.121 97.0909 410.636 94.5455C412.152 92 414.197 89.9848 416.773 88.5C419.348 87.0152 422.227 85.8939 425.409 85.1364C428.591 84.3788 431.833 83.803 435.136 83.4091C439.318 82.9242 442.712 82.5303 445.318 82.2273C447.924 81.8939 449.818 81.3636 451 80.6364C452.182 79.9091 452.773 78.7273 452.773 77.0909V76.7727C452.773 72.803 451.652 69.7273 449.409 67.5455C447.197 65.3636 443.894 64.2727 439.5 64.2727C434.924 64.2727 431.318 65.2879 428.682 67.3182C426.076 69.3182 424.273 71.5455 423.273 74L410.5 71.0909C412.015 66.8485 414.227 63.4242 417.136 60.8182C420.076 58.1818 423.455 56.2727 427.273 55.0909C431.091 53.8788 435.106 53.2727 439.318 53.2727C442.106 53.2727 445.061 53.6061 448.182 54.2727C451.333 54.9091 454.273 56.0909 457 57.8182C459.758 59.5455 462.015 62.0151 463.773 65.2273C465.53 68.4091 466.409 72.5455 466.409 77.6364V124H453.136V114.455H452.591C451.712 116.212 450.394 117.939 448.636 119.636C446.879 121.333 444.621 122.742 441.864 123.864C439.106 124.985 435.803 125.545 431.955 125.545ZM434.909 114.636C438.667 114.636 441.879 113.894 444.545 112.409C447.242 110.924 449.288 108.985 450.682 106.591C452.106 104.167 452.818 101.576 452.818 98.8182V89.8182C452.333 90.303 451.394 90.7576 450 91.1818C448.636 91.5758 447.076 91.9242 445.318 92.2273C443.561 92.5 441.848 92.7576 440.182 93C438.515 93.2121 437.121 93.3939 436 93.5455C433.364 93.8788 430.955 94.4394 428.773 95.2273C426.621 96.0152 424.894 97.1515 423.591 98.6364C422.318 100.091 421.682 102.03 421.682 104.455C421.682 107.818 422.924 110.364 425.409 112.091C427.894 113.788 431.061 114.636 434.909 114.636ZM510.648 125.364C505.011 125.364 499.981 123.924 495.557 121.045C491.163 118.136 487.708 114 485.193 108.636C482.708 103.242 481.466 96.7727 481.466 89.2273C481.466 81.6818 482.723 75.2273 485.239 69.8636C487.784 64.5 491.269 60.3939 495.693 57.5455C500.117 54.697 505.133 53.2727 510.739 53.2727C515.072 53.2727 518.557 54 521.193 55.4545C523.86 56.8788 525.92 58.5455 527.375 60.4545C528.86 62.3636 530.011 64.0455 530.83 65.5H531.648V30.9091H545.239V124H531.966V113.136H530.83C530.011 114.621 528.83 116.318 527.284 118.227C525.769 120.136 523.678 121.803 521.011 123.227C518.345 124.652 514.89 125.364 510.648 125.364ZM513.648 113.773C517.557 113.773 520.86 112.742 523.557 110.682C526.284 108.591 528.345 105.697 529.739 102C531.163 98.303 531.875 94 531.875 89.0909C531.875 84.2424 531.178 80 529.784 76.3636C528.39 72.7273 526.345 69.8939 523.648 67.8636C520.951 65.8333 517.617 64.8182 513.648 64.8182C509.557 64.8182 506.148 65.8788 503.42 68C500.693 70.1212 498.633 73.0151 497.239 76.6818C495.875 80.3485 495.193 84.4848 495.193 89.0909C495.193 93.7576 495.89 97.9545 497.284 101.682C498.678 105.409 500.739 108.364 503.466 110.545C506.223 112.697 509.617 113.773 513.648 113.773ZM594.727 125.409C587.848 125.409 581.924 123.939 576.955 121C572.015 118.03 568.197 113.864 565.5 108.5C562.833 103.106 561.5 96.7879 561.5 89.5455C561.5 82.3939 562.833 76.0909 565.5 70.6364C568.197 65.1818 571.955 60.9242 576.773 57.8636C581.621 54.803 587.288 53.2727 593.773 53.2727C597.712 53.2727 601.53 53.9242 605.227 55.2273C608.924 56.5303 612.242 58.5758 615.182 61.3636C618.121 64.1515 620.439 67.7727 622.136 72.2273C623.833 76.6515 624.682 82.0303 624.682 88.3636V93.1818H569.182V83H611.364C611.364 79.4242 610.636 76.2576 609.182 73.5C607.727 70.7121 605.682 68.5151 603.045 66.9091C600.439 65.303 597.379 64.5 593.864 64.5C590.045 64.5 586.712 65.4394 583.864 67.3182C581.045 69.1667 578.864 71.5909 577.318 74.5909C575.803 77.5606 575.045 80.7879 575.045 84.2727V92.2273C575.045 96.8939 575.864 100.864 577.5 104.136C579.167 107.409 581.485 109.909 584.455 111.636C587.424 113.333 590.894 114.182 594.864 114.182C597.439 114.182 599.788 113.818 601.909 113.091C604.03 112.333 605.864 111.212 607.409 109.727C608.955 108.242 610.136 106.409 610.955 104.227L623.818 106.545C622.788 110.333 620.939 113.652 618.273 116.5C615.636 119.318 612.318 121.515 608.318 123.091C604.348 124.636 599.818 125.409 594.727 125.409ZM648.864 54.1818L664.273 81.3636L679.818 54.1818H694.682L672.909 89.0909L694.864 124H680L664.273 97.9091L648.591 124H633.682L655.409 89.0909L633.955 54.1818H648.864Z" fill="white"/></svg>',
    description: 'The liquidity factory on Monad',
    gettingStartedGuide: 'https://monadex.gitbook.io',
    explore: 'https://monadex.exchange',

    // if your app only supports injected wallets and when no injected wallets detected, recommend the user to install some
    recommendedInjectedWallets: [
      {
        name: 'MetaMask',
        url: 'https://metamask.io'
      }
    ]
  }
})
