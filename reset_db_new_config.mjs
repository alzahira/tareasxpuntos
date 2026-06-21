
import { createClient } from '@supabase/supabase-js'

const url = 'https://elruuiazzbhfnpejdfct.supabase.co'
const key = 'sb_publishable_cjwbrVdSukGg2T0OviJy0g_2t-NEzc4'
const supabase = createClient(url, key);

const NEW_TASKS = [
    // Obligatorias (Daily) - Aiming for ~25 pts/day base
    { id: 't1', title: 'Poner la mesa', type: 'obligatory', points: 5, frequency: 'daily', completed: false },
    { id: 't2', title: 'No contestar mal', type: 'obligatory', points: 5, frequency: 'daily', completed: false },
    { id: 't3', title: 'Acostarse a la hora', type: 'obligatory', points: 5, frequency: 'daily', completed: false },
    { id: 't4', title: 'Hacer la cama', type: 'obligatory', points: 5, frequency: 'daily', completed: false },
    { id: 't5', title: 'Tener cuarto recogido', type: 'obligatory', points: 5, frequency: 'daily', completed: false },

    // Opcionales (Bonus)
    { id: 't6', title: 'Limpiar zona común (Salón/Baño)', type: 'bonus', points: 5, frequency: 'weekly', completed: false },
    { id: 't7', title: 'No protestar por la tele', type: 'bonus', points: 2, frequency: 'daily', completed: false },
    { id: 't8', title: 'Respetar espacio / No coaccionar', type: 'bonus', points: 2, frequency: 'daily', completed: false },
    { id: 't9', title: 'Semana sin enfados', type: 'bonus', points: 15, frequency: 'weekly', completed: false },
];

const NEW_REWARDS = [
    { id: 'r1', title: '10 min extra de Consola', cost: 5 },
    { id: 'r2', title: 'Elegir comida semanal', cost: 5 },
];

async function resetData() {
    console.log('Resetting database with new configuration...');

    // 1. Clear existing
    await supabase.from('tasks').delete().neq('id', '0'); // Delete all
    await supabase.from('rewards').delete().neq('id', '0');

    // 2. Insert new
    const { error: e1 } = await supabase.from('tasks').insert(NEW_TASKS);
    if (e1) console.error('Error inserting tasks:', e1);

    const { error: e2 } = await supabase.from('rewards').insert(NEW_REWARDS);
    if (e2) console.error('Error inserting rewards:', e2);

    console.log('Database reset complete!');
}

resetData();
