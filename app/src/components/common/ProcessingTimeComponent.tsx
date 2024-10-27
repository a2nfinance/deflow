import { Run } from "@/controller/experiment/experimentSlice";
import { RunStates } from "@/database/models/run";
import { Button } from "antd";
import { useEffect, useState } from "react";

const calculateSpentTime = (run: Run) => {
    let diffTime = 0;
    let toTime = new Date().getTime();
    if (run.state === RunStates.PROCESSING) {
        diffTime = toTime - new Date(run.time_started!).getTime();

    } else if (run.state === RunStates.FAILED || RunStates.FINISHED) {
        toTime = new Date(run.time_ended!).getTime();
        diffTime = toTime - new Date(run.time_started!).getTime(); ;
    } else {
        return `0h 0m 0s`
    }
    const duration = diffTime / 1000;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    return `${hours}h ${minutes}m ${seconds}s`

}
export const ProcessingTimeComponent = ({ run }: { run: Run }) => {
    const [timeSpent, setTimeSpent] = useState(`0h 0m 0s`);
    useEffect(() => {
        let timer;
        if (run.time_started) {
            timer = setInterval(() => setTimeSpent(calculateSpentTime(run))
                , 1000);
        }
        return () => clearInterval(timer);
    }, [run.time_started, run.time_ended])
    return <Button type="primary" size="large">Execution time: {timeSpent}</Button>
}