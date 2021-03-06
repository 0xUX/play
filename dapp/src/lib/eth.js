export const getEventAbi = (abi, event, stripIndexed=true) => {
    abi = JSON.parse(abi);
    for(let o of abi) {
        if(o.type == 'event' && o.name == event) {
            return _.remove(o.inputs, function(i) {
                return stripIndexed && !i.indexed;
            });
        }
    }
    return {};
};


export const getGasEstimate = async (web3, account, method, ...params) => {
    const gasPrice = await web3.eth.getGasPrice();    
    const estimateGas = await method.apply(this, params).estimateGas({
        from: account               
    });
    
    const costEstimate = gasPrice * estimateGas;
    const proposedGasLimit = Math.round(estimateGas * 1.2);
    
    return [gasPrice, estimateGas, costEstimate, proposedGasLimit];
};
