import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const [isLogged, setIsLogged] = useState(false);
    const [hasTwoFa, setHasTwoFa] = useState(true);

    const [userId, setUserId] = useState(0);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    const [bpColor, setBpColor] = useState('#ffffff');
    const [ringsColor, setRingsColor] = useState('#ffffff');
    const [suitColor, setSuitColor] = useState('#ffffff');
    const [visColor, setVisColor] = useState('#ffffff');

    const [flatness, setFlatness] = useState(2.8);
    const [horizontalPosition, setHorizontalPosition] = useState(7.5);
    const [verticalPosition, setVerticalPosition] = useState(0.0);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/me/', {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const json = await response.json();
                if (json?.success == true) {
                    setIsLogged(true);
                    setHasTwoFa(json.twofa_enabled);
                    setUserId(json.user_id);
                    setUsername(json.username);
                    setEmail(json.email);
                    setProfilePicture(json.profile_picture_url);
                    setSuitColor(json.suitColor);
                    setBpColor(json.bpColor);
                    setRingsColor(json.ringsColor);
                    setVisColor(json.visColor);
                    setFlatness(json.flatness);
                    setHorizontalPosition(json.horizontalPosition);
                    setVerticalPosition(json.verticalPosition);
                }
            } else {
                setIsLogged(false);
            }
        } catch (error) {
            setIsLogged(false);
        }
        setIsLoading(false);
    };

    const login = async () => {
        fetchUserData();
    };

    const logout = async () => {
        setIsLoading(true);
        setIsLogged(false);
        setHasTwoFa(true);
        setUserId(0);
        setUsername('');
        setEmail('');
        setProfilePicture('');
        setSuitColor('#ffffff');
        setBpColor('#ffffff');
        setRingsColor('#ffffff');
        setVisColor('#ffffff');
        setFlatness(2.8);
        setHorizontalPosition(7.5);
        setVerticalPosition(0.0);
        setIsLoading(false);
    };

    const reload = async () => {
        fetchUserData();
    };

    return (
        <UserContext.Provider value={{
            isLoading, setIsLoading,
            isLogged, setIsLogged,
            hasTwoFa, setHasTwoFa,
            userId, setUserId,
            username, setUsername,
            email, setEmail,
            profilePicture, setProfilePicture,
            bpColor, setBpColor,
            ringsColor, setRingsColor,
            suitColor, setSuitColor,
            visColor, setVisColor,
            flatness, setFlatness,
            horizontalPosition, setHorizontalPosition,
            verticalPosition, setVerticalPosition,
            login,
            logout,
            reload
        }} >
            {children}
        </UserContext.Provider>
    );
};
