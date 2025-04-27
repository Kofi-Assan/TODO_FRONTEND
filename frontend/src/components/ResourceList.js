import React from 'react';
import { Table, Badge } from 'react-bootstrap';

const ResourceList = ({ resources, onEdit, onDelete }) => {
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'Available':
                return 'success';
            case 'Booked':
                return 'warning';
            case 'Maintenance':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getCategoryBadgeVariant = (category) => {
        switch (category) {
            case 'Room':
                return 'info';
            case 'Equipment':
                return 'primary';
            case 'Facility':
                return 'dark';
            default:
                return 'secondary';
        }
    };

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {resources.map(resource => (
                    <tr key={resource._id}>
                        <td>{resource.name}</td>
                        <td>{resource.description}</td>
                        <td>
                            <Badge bg={getCategoryBadgeVariant(resource.category)}>
                                {resource.category}
                            </Badge>
                        </td>
                        <td>
                            <Badge bg={getStatusBadgeVariant(resource.status)}>
                                {resource.status}
                            </Badge>
                        </td>
                        <td>
                            <button 
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => onEdit(resource)}
                            >
                                Edit
                            </button>
                            <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => onDelete(resource._id)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default ResourceList; 