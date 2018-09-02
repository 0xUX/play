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
