import { Redis } from '@upstash/redis'

type User = {
  id: string;
  username: string;
  password: string;
};

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

async function getUsers(): Promise<User[]> {
  try {
    const usersString = await redis.get('users');
    console.log('Raw users data from Redis:', usersString);
    if (!usersString) {
      console.log('No users found in Redis');
      return [];
    }
    let users: User[];
    if (typeof usersString === 'string') {
      users = JSON.parse(usersString);
    } else if (Array.isArray(usersString)) {
      users = usersString;
    } else {
      console.error('Unexpected data type for users:', typeof usersString);
      return [];
    }
    if (!Array.isArray(users)) {
      console.error('Users data is not an array');
      return [];
    }
    console.log('Retrieved users:', users);
    return users;
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

async function setUsers(users: User[]): Promise<void> {
  try {
    const usersString = JSON.stringify(users);
    await redis.set('users', usersString);
    console.log('Users updated successfully. Stored data:', usersString);
  } catch (error) {
    console.error('Error writing users:', error);
    throw new Error('Failed to update users');
  }
}

export async function addUser(username: string, password: string): Promise<User> {
  console.log('Adding new user:', username);
  let users = await getUsers();
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    throw new Error('Username already exists');
  }
  const newUser: User = { id: Date.now().toString(), username, password };
  users.push(newUser);
  await setUsers(users);
  return newUser;
}

export async function findUser(username: string): Promise<User | undefined> {
  console.log('Searching for user:', username);
  const users = await getUsers();
  const user = users.find(user => user.username === username);
  console.log('User found:', user);
  return user;
}

export function validatePassword(user: User, password: string): boolean {
  return user.password === password;
}

