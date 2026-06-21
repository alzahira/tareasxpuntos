
import { createClient } from '@supabase/supabase-js'

const url = 'https://elruuiazzbhfnpejdfct.supabase.co'
const key = 'sb_publishable_cjwbrVdSukGg2T0OviJy0g_2t-NEzc4'

console.log('Testing Supabase Connection...');
console.log('URL:', url);
console.log('Key:', key);

const supabase = createClient(url, key);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('app_state').select('*');
        if (error) {
            console.error('Connection Failed:', error); // Log full error object
        } else {
            console.log('Connection Successful! Data:', data);
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testConnection();
