'use client'
import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { fetchUsers } from '@/app/api/users/route';
import './table.css'


interface User {
    name: string;
    gender: string;
    email: string;
}

const UserTable: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchName, setSearchName] = useState('');
    const [searchGender, setSearchGender] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedRows, setSelectedRows] = useState<number[]>([]);



    const fetchUsersData = async () => {
        const data = await fetchUsers();
        setUsers(data);
    };

    useEffect(() => {
        fetchUsersData();
    }, []);

    const handleSearchName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchName(event.target.value);
    };

    const handleSearchGender = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchGender(event.target.value);
    };

    const handleSearchEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchEmail(event.target.value);
    };

    const handleSort = (column: string) => {
        if (column === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const handleExportCSV = () => {
        const selectedUsers = selectedRows.map((index) => users[index]);
        const csvData = selectedUsers.map((user) => ({
            Name: user.name,
            Gender: user.gender,
            Email: user.email,
        }));
        return csvData;
    };

    const handleRowSelect = (index: number) => {
        if (selectedRows.includes(index)) {
            setSelectedRows(selectedRows.filter((row) => row !== index));
        } else {
            setSelectedRows([...selectedRows, index]);
        }
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const updatedRows = [...users];
        const [draggedRow] = updatedRows.splice(result.source.index, 1);
        updatedRows.splice(result.destination.index, 0, draggedRow);
        setUsers(updatedRows);
    };

    const getSortedUsers = () => {
        const sortedUsers = [...users];
        sortedUsers.sort((a: User, b: User) => {
            const valueA = a[sortBy as keyof User];
            const valueB = b[sortBy as keyof User];
            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return sortedUsers;
    };

    const filteredUsers = getSortedUsers().filter((user) => {
        const nameMatch = user.name.toLowerCase().includes(searchName.toLowerCase());
        const genderMatch = user.gender.toLowerCase().includes(searchGender.toLowerCase());
        const emailMatch = user.email.toLowerCase().includes(searchEmail.toLowerCase());
        return nameMatch && genderMatch && emailMatch;
    });

    return (
        <div className='container'>
            <h2>User Table</h2>
            <div style={{ display: 'flex', gap: 10, width: '70%' }}>
                <div style={{ width: '40%', height: '30px' }}>
                    <input type="text" placeholder="Search by name" value={searchName} onChange={handleSearchName} className='inputs' />
                </div>
                <div style={{ width: '10%', height: '30px' }}>
                    <select value={searchGender} onChange={handleSearchGender} className='inputs'>
                        <option value="">All Genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div style={{ width: '50%', height: '30px' }}>
                    <input type="text" placeholder="Search by email" value={searchEmail} onChange={handleSearchEmail} className='inputs' />
                </div>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="user-table" direction="vertical">
                    {(provided) => (
                        <table ref={provided.innerRef} {...provided.droppableProps} className='user-table'>
                            <thead>
                                <tr>

                                    <th onClick={() => handleSort('name')}>Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                                    <th onClick={() => handleSort('gender')}>
                                        Gender {sortBy === 'gender' && (sortOrder === 'asc' ? '▲' : '▼')}
                                    </th>
                                    <th onClick={() => handleSort('email')}>
                                        Email {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
                                    </th>
                                </tr>
                            </thead>
                            <Droppable droppableId="user-rows" direction="vertical">
                                {(provided) => (
                                    <tbody ref={provided.innerRef} {...provided.droppableProps}>
                                        {filteredUsers.map((user, index) => (
                                            <Draggable key={index} draggableId={`user-${index}`} index={index}>
                                                {(provided) => (
                                                    <tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => handleRowSelect(index)}
                                                        className={selectedRows.includes(index) ? 'selected' : ''}
                                                    >
                                                        <td style={{ width: '40%', height: '30px' }}>{user.name}</td>
                                                        <td style={{ width: '10%', height: '30px' }}>{user.gender}</td>
                                                        <td style={{ width: '50%', height: '30px' }}>{user.email}</td>
                                                    </tr>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </tbody>
                                )}
                            </Droppable>
                        </table>
                    )}
                </Droppable>
            </DragDropContext>
            {selectedRows.length > 0 &&

                <CSVLink data={handleExportCSV()} filename="selected_users.csv" className='export-button'>Export CSV</CSVLink>

            }
        </div>
    );
};

export default UserTable;
