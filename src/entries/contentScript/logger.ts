console.log("fff")

import { createPinia } from "pinia";
import { useApiLogsStore } from "../store/apiLogs";

const pinia = createPinia();
const apiLogs = useApiLogsStore(pinia)

/* 
  An issue with this is right now any website can create their own message and send it to this contentscript to be logged.
  This can allow them to max out our extension storage and break.
  To resolve it, we can verify that the domainId is a real one as thats semi-secure way to prevent abuse.
  Better yet, only run this contentscript when we inject the payload so only websites we are debugging will be able to abuse it.
*/
window.addEventListener("message", function(event) {
  console.log("received message event",event)
  if (event.source != window) return;
  console.log(event.data.type)
  if (event.data.type && event.data.type == "LOGAPI") {
    let batch = event.data.batch;
    console.log(event.data.domainId,batch)
    apiLogs.logBatch(event.data.domainId,batch)
  }
})