interface URLEntry {
    url?: string 
}
export interface GenerateImageResponse {
    data : Array<URLEntry>,
    created : number 
}

export interface GenerateImageRequest {
    text : string 
}