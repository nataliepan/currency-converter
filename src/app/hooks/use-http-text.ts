import { useState } from 'react';

const useHttpText = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRequest = async (requestConfig: Request, applyData: (data: any) => void) => {
        setIsLoading(true);
        setError(null);
        try{
            const response = await fetch(requestConfig.url, {
                method: requestConfig.method ? requestConfig.method : 'GET',
                headers: requestConfig.headers ? requestConfig.headers : {},
                body: requestConfig.body ? JSON.stringify(requestConfig.body) : null
                
            });
            if(!response.ok){
                throw new Error('Request failed!');
            }
            const data = await response.text();
            applyData(data)
        } catch (error: any) {
            setError(error.message || 'Something went wrong!');
        }
        setIsLoading(false);
    };

    return {
        isLoading,
        error,
        fetchRequest
    }
}

export default useHttpText;