/**
 * Request Information 
 */
export interface RequestInfo {
    method: string;
    uri: string;
    baggage?: string;
    clientIp?: string;
    sourceSystem?: string;
    id?: string;
  }