import { useHandleSignInCallback } from '@logto/react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const navigate = useNavigate();
    const { isLoading } = useHandleSignInCallback(() => {
        // Redirect to root after successful sign-in
        navigate('/');
    });

    if (isLoading) {
        return (
            <div className="app-wrapper">
                <div className="gradient-bg"></div>
                <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                    <h2 className="text-gradient">Loading...</h2>
                </div>
            </div>
        );
    }

    return null;
};

export default Callback;
