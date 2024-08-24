export class Host {
    name:string = $state("")
    ip:string = $state("")
    port:number=$state(3000)
    visibile=$state(true)
    host=$state(true)
    pinged=$state(false)
    
}