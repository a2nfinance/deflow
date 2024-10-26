import { Run } from "@/controller/experiment/experimentSlice";
import { RunStates } from "@/database/models/run";
import { Button } from "antd";
import { useEffect, useState } from "react";

const calculateSpentTime = (run: Run) => {
    if (run.state !== RunStates.CREATED && run._id && run.time_started) {
        console.log("RUN:", run);
        let toTime = run.time_ended ? new Date(run.time_ended!).getTime() : new Date().getTime();
        let diffTime = toTime - new Date(run.time_started!).getTime();
        if (diffTime < 0) {
            diffTime = new Date().getTime() - new Date(run.time_started!).getTime();
        }
        console.log(diffTime);
        const duration = diffTime/1000;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60); 
        return `${hours}h ${minutes}m ${seconds}s`
    } else {
         return `0h 0m 0s`
    }
   
}
export const ProcessingTimeComponent = ({run}: {run: Run}) => {
    const [timeSpent, setTimeSpent] = useState(`0h 0m 0s`);
    useEffect(()=>{
        let timer;
        if (run.time_started && !run.time_ended) {
            timer = setInterval(() => setTimeSpent(calculateSpentTime(run))
            , 1000);
        }
        if (run.time_ended && run.time_ended > run.time_started!) {
            setTimeSpent(calculateSpentTime(run))
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [run.time_started, run.time_ended])
    return <Button type="primary"  size="large">Exectution time: {timeSpent}</Button>
}