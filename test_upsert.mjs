import { createClient } from '@supabase/supabase-js'

const url = 'https://srpuxdhdpegbtyioonsb.supabase.co'
const key = 'sb_publishable_z9KPjjt6KDQXL0r9aDzZ1g_fyLs0SfR'
const supabase = createClient(url, key);

async function testUpsert() {
    try {
        console.log("Testing upsert...");
        const { data, error } = await supabase.from('app_state').upsert({ key: 'test_key', value: { a: 1 } });
        if (error) {
            console.error('Upsert Failed:', error);
        } else {
            console.log('Upsert Successful! Data:', data);
        }
        
        // clean up
        await supabase.from('app_state').delete().eq('key', 'test_key');
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testUpsert();
