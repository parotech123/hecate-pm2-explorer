import { parse } from "date-fns";
import orderBy from 'lodash-es/orderBy';
import { get } from "svelte/store";
import type { ProcessData } from "./PM2Wrapper";
import { chartDataStore } from "./stores/chart-data.svelte";
import { CrudState } from "./stores/crud.state.svelte";
import { errorsStore } from "./stores/errors.store";
import { logsStore } from './stores/logs.store';
import { splitterStore } from "./stores/splitter.store";
import {Logging} from "./stores/logs.state.svelte";


export let logging = new Logging();

export let processes = new CrudState<ProcessData>('name');

export async function updateProcesses() {

    processes.loading = true
    const res = await fetch('/api/processes');
    const data: ProcessData[] = await res.json();

    processes.reset()
    processes.data = data



    data.forEach(element => {
        let history = chartDataStore.find((c) => c.name === element.name)

        if (!history) {

            history = {
                name: element.name,
                cpus: []
            }

            chartDataStore.push(history)

        }

        history.cpus.push(element.cpu == 0 ? 0.01 : element.cpu)
    });

    console.log(chartDataStore);

    processes.loading = false

}

export async function deleteProcess(p: ProcessData) {
    processes.loading = true
    let result = await fetch(`/api/processes/delete`, {
        method: 'POST',
        body: JSON.stringify({
            id: p.pm_id
        }),
        headers: {
            'Content-Type': 'application/json',
        }

    });

    console.log(result);
    // await sleep(1000)

    await updateProcesses();
    processes.loading = false
}

export async function restartProcess(p: ProcessData) {
    processes.loading = true
    let result = await fetch(`/api/processes/restart/${p.pm_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }

    });

    console.log(result);
    // await sleep(1000)

    await updateProcesses();
    processes.loading = false
}

export async function stopProcess(p: ProcessData) {
    processes.loading = true
    let result = await fetch(`/api/processes/stop/${p.pm_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }

    });

    console.log(result);
    // await sleep(1000)

    await updateProcesses();
    processes.loading = false
}

export async function describeProcess(p: ProcessData) {
    processes.loading = true
    let result = await fetch(`/api/processes/describe/${p.pm_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }

    });

    console.log(result);
    // await sleep(1000)

    await updateProcesses();
    processes.loading = false
}

export async function loadProcessesFromStorage() {
    const savedProcesses = localStorage.getItem('processes');

    if (savedProcesses) {
        const ips = JSON.parse(savedProcesses);

        for (let ipInfo of ips) {
            const res = await fetch(`/api/processes/${ipInfo.ip}`);
            const data = await res.json();

            processes.data = data
        }
    }
};


export async function fetchProcesses(subnet: string) {
    processes.loading = true
    const res = await fetch(`/api/remoteProcesses?subnet=${subnet}`);
    const data = await res.json();
    localStorage.setItem('processes', JSON.stringify(data.allProcesses));
    processes.data = data.allProcesses

    processes.loading = false
};


export async function flushLogs(p: ProcessData) {


    processes.loading = true
    const res = await fetch(`/api/processes/logs/${p.name}/flush`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name
        })
    });
    if (res.ok) {
        alert('Logs flushed');
    }


    processes.loading = false

}


export async function fetchLogs(p: ProcessData | null, lines?: number) {

    if (!p) return

    processes.loading = true

    const res = await fetch(`/api/processes/logs/${p.name}?lines=${lines || 10}`);
    const data = await res.json();

    console.log(data)

    // let work = JSON.parse(data.outLogs)

    let logs = data.outLogs.split('\n').map((l: any) => {



        try {
            let log = JSON.parse(l.replace("\n", ""))

            log.timestamp = parse(log.timestamp.split(" ")[0] + " " + log.timestamp.split(" ")[1], 'dd/MM HH:mm:ss.SSS', new Date());


            let splitted = log.message.split(get(splitterStore))

            log.message = splitted.filter((l: string, i: number) => {

                return splitted.length > 1 ? i > 0 : true

            }).join(get(splitterStore))
            console.log(log)

            return log
        } catch (error) {

            console.log(l)
            return l
        }
    })
        .filter((l: any) => Boolean(l))
    logsStore.set(logs);


    let errors = data.errLogs.split('\n').map((l: any) => {
        try {
            let log = JSON.parse(l.replace("\n", ""))

            log.timestamp = parse(log.timestamp.split(" ")[0] + " " + log.timestamp.split(" ")[1], 'dd/MM HH:mm:ss.SSS', new Date());

            return log
        } catch (error) {
            console.log(l)
            return
        }

    })
        .filter((l: any) => Boolean(l))

    errorsStore.set(errors);

    logging.logs = orderBy([...logs, ...errors], 'timestamp', 'desc')

    console.log(logging.logs)
    processes.loading = false

}