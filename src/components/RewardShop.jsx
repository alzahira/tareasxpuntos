import React from 'react';
import { Gift, Lock, Trash2, Pencil } from 'lucide-react';

export function RewardShop({ rewards, userPoints, onRedeem, onDelete, onEdit, isAdmin }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {rewards.map(reward => {
                const canAfford = userPoints >= reward.cost;
                return (
                    <button
                        key={reward.id}
                        onClick={() => canAfford && onRedeem(reward.id)}
                        disabled={!canAfford}
                        style={{
                            backgroundColor: 'var(--color-card-bg)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem',
                            boxShadow: 'var(--shadow-sm)',
                            opacity: canAfford ? 1 : 0.6,
                            position: 'relative',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {!canAfford && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                <Lock size={16} color="#999" />
                            </div>
                        )}
                        <div style={{
                            backgroundColor: 'var(--color-accent)',
                            padding: '10px',
                            borderRadius: '50%',
                            marginBottom: '0.5rem'
                        }}>
                            <Gift size={24} color="white" />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{reward.title}</h4>
                        <span style={{
                            fontWeight: 'bold',
                            color: canAfford ? 'var(--color-primary)' : '#999'
                        }}>
                            {reward.cost} pts
                        </span>
                        {isAdmin && (
                            <>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(reward);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '5px',
                                        left: '5px',
                                        background: 'var(--color-text)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 10,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Pencil size={14} />
                                </div>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(reward.id);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '5px',
                                        background: '#ff4444',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 10,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Trash2 size={14} />
                                </div>
                            </>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
