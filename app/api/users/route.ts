import axios from "axios";

export const fetchUsers = async () => {
    try {
        const response = await axios.get('https://randomuser.me/api/?results=10');
        const data = response.data.results.map((user: any) => ({
            name: `${user.name.first} ${user.name.last}`,
            gender: user.gender,
            email: user.email,
        }));
        return data;
    } catch (error) {
        console.log(error);
        return [];
    }
};