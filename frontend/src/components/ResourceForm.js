import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const ResourceForm = ({ onSubmit, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        description: '',
        category: 'Room',
        status: 'Available'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                >
                    <option value="Room">Room</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Facility">Facility</option>
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit">
                {initialData ? 'Update Resource' : 'Create Resource'}
            </Button>
        </Form>
    );
};

export default ResourceForm; 