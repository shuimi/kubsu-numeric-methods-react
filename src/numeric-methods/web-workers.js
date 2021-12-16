import { useEffect, useRef, useState } from "react";

const workerHandler = (func) => {
    onmessage = (event) => {
        postMessage(func(event.data))
    }
}

export const useWebWorker = (func) => {

    const [result, setResult] = useState(null)

    const workerRef = useRef(null)

    useEffect(() => {

        const worker = new Worker(
            URL.createObjectURL(
                new Blob([`(${workerHandler})(${func})`])
            )
        )
        workerRef.current = worker

        worker.onmessage = (event) => {
            setResult(event.data)
        }

        return () => {
            worker.terminate()
        }

    }, [func])

    return {
        result,
        run: (value) => workerRef.current.postMessage(value)
    }

}