// Adapted and extended from https://github.com/hussy-io/react-web3-provider
import React from 'react';
import Web3 from 'web3';
import hoistNonReactStatics from 'hoist-non-react-statics';
import PropTypes from 'prop-types';
import { networkDetails } from '../lib/network';

// @@@ TODO:
// - include subscription provider (if some props says we want it)
// - cleanup context, just two toplevel vars: web3MM and web3Infure

const Web3Context = React.createContext(null);


class Web3Provider extends React.Component {
    state = {
        web3: null,
        connection: {
            connected: false,
            isLoading: true,
            error: null,
        },
        currentProvider: null,
        accounts: [],
        network: {},
        error: false
    };


    updateAccountsNetwork = async () => {
        const { web3 } = this.state;
        // Get accounts info
        try {
            const accounts = await web3.eth.getAccounts();
            this.setState({ accounts });
        } catch(error) {
            this.setState({ error: `Error retreiving accounts: ${error}`});
        }
        
        // Get connected network info
        try {
            const networkId = await web3.eth.net.getNetworkType();
            const network = networkDetails(networkId);
            this.setState({ network });
        } catch(error) {
            this.setState({ error: `Error retreiving network info: ${error}`});
        }
    }
    
    async initWeb3(provider) {
        const web3 = new Web3(provider);
        
        this.setState({ web3 });
        
        // We have a stable web3 interface now
        // Check network connection state
        try {
            await web3.eth.net.isListening(); // @@@ does this block until connected?
            this.setState({
                connection: {
                    isConnected: true,
                    isLoading: false,
                    error: null
                }
            });
        } catch(error) {
            this.setState({
                web3: null,
                connection: {
                    isConnected: false,
                    isLoading: false,
                    error
                }
            });
        }
        
        // Subscribe to updates in case the provider supports it
        if (web3.currentProvider) {
            this.updateAccountsNetwork();
            this.setState({ currentProvider: web3.currentProvider.constructor.name });
            if (web3.currentProvider.publicConfigStore) {
                web3.currentProvider.publicConfigStore.on(
                    'update', (...args) => {
                        //console.log('publicConfigStore update:', JSON.stringify(args));
                        this.updateAccountsNetwork();
                    }
                );
            }; // @@@@ fall back to polling? @@@
        };
    }

    componentDidMount() {
        if (window.web3) {
            // Use MetaMask using global window object
            this.initWeb3(window.web3);
        } else if (Web3.givenProvider) {
            // Use wallet-enabled browser provider
            this.initWeb3(Web3.givenProvider);
        } else {
            const { defaultWeb3Provider } = this.props;
            const whereAreWe = (location.hostname === "localhost" || location.hostname === "127.0.0.1") ? 'local' : 'server';
            const whereWeWantToBe = (defaultWeb3Provider.indexOf("localhost") >= 0 || defaultWeb3Provider.indexOf("127.0.0.1") >= 0 ) ? 'local' : 'server';
            if(whereAreWe == whereWeWantToBe) {
                // RPC fallback (e.g. INFURA node)
                this.initWeb3(new Web3.providers.HttpProvider(this.props.defaultWeb3Provider));
            } else {
                this.setState({                    
                    connection: {
                        isConnected: false,
                        isLoading: false,
                        error: false
                    }
                });
            }

            // @@@ TODO: implement when needed:
            // Breaking changes in MetaMask => see: https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
            // Listen for provider injection
            // window.addEventListener('message', ({ data }) => {
            //     if (data && data.type && data.type === 'ETHEREUM_PROVIDER_SUCCESS') {
            //         this.initWeb3(window.ethereum);
            //     }
            // });
            // 
            // Request provider
            // window.postMessage({ type: 'ETHEREUM_PROVIDER_REQUEST' }, '*');
        }
    }

    render() {
        return (
            <Web3Context.Provider value={{
                                      web3: this.state.web3,
                                      connection: this.state.connection,
                                      currentProvider: this.state.currentProvider,
                                      accounts: this.state.accounts,
                                      network: this.state.network,
                                      error: this.state.error
                                  }}>
              {this.props.children}
            </Web3Context.Provider>
        );
    }
};


Web3Provider.propTypes = {
    defaultWeb3Provider: PropTypes.string.isRequired
};

export default Web3Provider;

export const withWeb3 = (WrappedComponent) => {
    class Web3Consumer extends React.Component {
        render() {
            return (
                <Web3Context.Consumer>
                  {context =>
                      <WrappedComponent
                            {...this.props}
                            web3={context.web3}
                            web3State={context.connection}
                            currentProvider={context.currentProvider}
                            accounts={context.accounts}
                            network={context.network}
                            error={context.error}
                            />
                      }
                </Web3Context.Consumer>
            );
        }
    }

     Web3Consumer.displayName = `withWeb3(${getDisplayName(WrappedComponent)})`;
    
    if (WrappedComponent.defaultProps) {
        Web3Consumer.defaultProps = WrappedComponent.defaultProps ;
    }

    return hoistNonReactStatics(Web3Consumer, WrappedComponent);
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
