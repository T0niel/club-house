class HttpError extends Error{
    constructor(msg, httpType){
        super(msg);
        this.httpType = httpType;
    }
}