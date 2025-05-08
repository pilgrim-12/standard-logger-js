/**
* Keys for storing HTTP context data
 */
export enum HttpContextKey {
    RequestId = "requestId",
    Method = "method",
    Uri = "uri",
    ClientIp = "clientIp",
    SourceSystem = "sourceSystem",
    TraceId = "traceId",
    SpanId = "spanId",
    ServiceIp = "serviceIp",
    ServicePort = "servicePort",
    Baggage = "baggage"
  }

 // where did these keys come from, are they described in the standard ??