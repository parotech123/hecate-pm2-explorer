import { parse } from "date-fns";
import orderBy from 'lodash-es/orderBy';
import type { ProcessData } from "./PM2Wrapper";
import { errorsStore } from "./stores/errors.store";
import { loadingStore } from "./stores/loading.store";
import { logsStore } from './stores/logs.store';
import { mixLogsStore } from "./stores/mix-logs.store";
import { processesStore } from './stores/process.store';
import { get } from "svelte/store";

export async function updateProcesses() {
    loadingStore.set(true);
    const res = await fetch('/api/processes');
    const data = await res.json();
    processesStore.reset();
    processesStore.replace(data);
    console.log(data);
    loadingStore.set(false);

}

export async function deleteProcess(p: ProcessData) {
    loadingStore.set(true);
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
    loadingStore.set(false);
}


export async function loadProcessesFromStorage() {
    const savedProcesses = localStorage.getItem('processes');

    if (savedProcesses) {
        const ips = JSON.parse(savedProcesses);

        for (let ipInfo of ips) {
            const res = await fetch(`/api/processes/${ipInfo.ip}`);
            const data = await res.json();

            processesStore.replace(data);
        }
    }
};


export async function fetchProcesses(subnet: string) {
    loadingStore.set(true);
    const res = await fetch(`/api/remoteProcesses?subnet=${subnet}`);
    const data = await res.json();
    localStorage.setItem('processes', JSON.stringify(data.allProcesses));
    processesStore.replace(data.allProcesses);

    loadingStore.set(false);
};


export async function flushLogs(p: ProcessData) {


    loadingStore.set(true);
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


    loadingStore.set(false);

}


export async function fetchLogs(p: ProcessData | null, lines?: number) {

    if (!p) return

    loadingStore.set(true);

    const res = await fetch(`/api/processes/logs/${p.name}?lines=${lines || 10}`);
    const data = await res.json();

    let logs = data.outLogs.split('\n').map((l: any) => {


        

        try {
            let log = JSON.parse(l.replace("\n", ""))

            log.timestamp = parse(log.timestamp.split(" ")[0] + " " + log.timestamp.split(" ")[1], 'dd/MM HH:mm:ss.SSS', new Date());
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

    mixLogsStore.set(orderBy([...logs, ...errors], 'timestamp', 'desc'))

    console.log(get(mixLogsStore))
    loadingStore.set(false);

}