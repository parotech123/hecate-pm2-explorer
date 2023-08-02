import type { ProcessData } from "./PM2Wrapper";
import { processesStore } from './process.store';
import { logsStore } from './logs.store';
import { errorsStore } from "./errors.store";
import { mixLogsStore } from "./mix-logs.store";
import orderBy from 'lodash-es/orderBy';
import { parse } from "date-fns";
import { sleep } from "./utils";

export async function updateProcesses() {
    const res = await fetch('/api/processes');
    const data = await res.json();
    processesStore.reset();
    processesStore.replace(data);
    console.log(data);
    
}

export async function deleteProcess(p: ProcessData) {
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
    const res = await fetch(`/api/remoteProcesses?subnet=${subnet}`);
    const data = await res.json();
    localStorage.setItem('processes', JSON.stringify(data.allProcesses));
    processesStore.replace(data.allProcesses);
};


export async function flushLogs(p: ProcessData) {
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
}


export async function fetchLogs(p: ProcessData) {
    const res = await fetch(`/api/processes/logs/${p.name}`);
    const data = await res.json();

    let logs = data.outLogs.split('\n').map((l: any) => {

        try {
            let log = JSON.parse(l.replace("\n", ""))

            log.timestamp = parse(log.timestamp.split(" ")[0] + " " + log.timestamp.split(" ")[1], 'yyyy-MM-dd HH:mm', new Date());
            return log
        } catch (error) {

            console.log(l)
            return
        }
    })
        .filter((l: any) => Boolean(l))

    logsStore.set(logs);


    let errors = data.errLogs.split('\n').map((l: any) => {
        try {
            let log = JSON.parse(l.replace("\n", ""))

            log.timestamp = parse(log.timestamp.split(" ")[0] + " " + log.timestamp.split(" ")[1], 'yyyy-MM-dd HH:mm', new Date());

            return log
        } catch (error) {
            console.log(l)
            return
        }

    })
        .filter((l: any) => Boolean(l))

    errorsStore.set(errors);

    mixLogsStore.set(orderBy([...logs, ...errors], 'timestamp', 'desc'))



}