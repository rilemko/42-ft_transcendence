import React, { useState, useEffect } from 'react';

import { useToast } from '../../contexts/ToastContext';

import './BaseForm.css'

const BaseForm = ({ handleValidation = () => {}, onSuccess = () => {}, onFailure = () => {}, target = '/', type = 'json', method = 'POST', headers = {}, disabled = false, children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [fileData, setFileData] = useState({});

    const { addToast } = useToast();

    useEffect(() => {
        const initialData = {};
        const extractInitialValues = (children) => {
            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child)) {
                    if (child.props.children) {
                        extractInitialValues(child.props.children);
                    } else if (child.props.name) {
                        initialData[child.props.name] = formData[child.props.name] || child.props.value || '';
                    }
                }
            });
        };
        extractInitialValues(children);
        setFormData(initialData);
    }, [children]);

    const handleChange = async (event) => {
        const { name, value, type, files: inputFiles } = event.target;
        if (type === 'file') setFileData((prevFileData) => ({ ...prevFileData, [name]: inputFiles[0], }));
        else setFormData((prevFormData) => ({ ...prevFormData, [name]: value, }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (handleValidation(event.target) === true)
        {
            let body;

            if (type === 'file') {
                body = new FormData();
                Object.keys(fileData).forEach(key => {
                    body.append(key, fileData[key]);
                });
            } else {
                body = JSON.stringify(formData);
            }
            try {
                const response = await fetch(target, {
                    method: method, headers: headers, body: body, credentials: 'include'
                });
                const json = await response.json();
                if (response.ok) {
                    if (json?.success === true) {
                        onSuccess(json);
                    } else {
                        addToast(json?.message || 'An error has occured.', 'failure', 10000);
                        onFailure(json);
                    }
                } else {
                    addToast(json?.message || 'An error has occured.', 'failure', 10000);
                    onFailure(json);
                }
            } catch (error) {
                addToast('An error has occured.', 'failure', 10000);
                onFailure();
            }
        }
        setIsLoading(false);
    };

    const cloneChildrenWithProps = (children) => {
        return React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                if (child.props.children) {
                    return React.cloneElement(child, {
                        children: cloneChildrenWithProps(child.props.children)
                    });
                }
                return React.cloneElement(child, {
                    onChange: (event) => { if (child.props.onChange) child.props.onChange(event); handleChange(event) },
                    isLoading: isLoading,
                    value: child.props.type === 'file' ? undefined : formData[child.props.name] || child.props.value || '',
                    disabled: disabled || child.props.disabled
                });
            }
            return child;
        });
    };

    return (
        <form onSubmit={handleSubmit} >
            {cloneChildrenWithProps(children)}
        </form>
    );
};

export default BaseForm;
