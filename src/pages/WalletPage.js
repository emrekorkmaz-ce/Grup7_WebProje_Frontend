import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './WalletPage.css';

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, [page]);

  const fetchWallet = async () => {
    try {
      const response = await api.get('/wallet/balance');
      setWallet(response.data.data);
      setError('');
    } catch (err) {
      setError('Cüzdan bilgileri yüklenemedi.');
      console.error('Error fetching wallet:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wallet/transactions', {
        params: { page, limit: 20 }
      });
      setTransactions(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setError('');
    } catch (err) {
      setError('İşlem geçmişi yüklenemedi.');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    if (!topupAmount || parseFloat(topupAmount) < 50) {
      alert('Minimum yükleme tutarı 50 TRY\'dir.');
      return;
    }

    try {
      const response = await api.post('/wallet/topup', {
        amount: parseFloat(topupAmount)
      });

      // Redirect to payment gateway
      if (response.data.data.paymentUrl) {
        window.location.href = response.data.data.paymentUrl;
      } else {
        alert('Ödeme sayfası oluşturulamadı.');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Para yükleme başlatılamadı.');
    }
  };

  const getTransactionTypeLabel = (type) => {
    return type === 'credit' ? 'Yükleme' : 'Harcama';
  };

  const getTransactionTypeClass = (type) => {
    return type === 'credit' ? 'transaction-credit' : 'transaction-debit';
  };

  const getReferenceTypeLabel = (type) => {
    const labels = {
      topup: 'Para Yükleme',
      meal_reservation: 'Yemek Rezervasyonu',
      event_registration: 'Etkinlik Kaydı',
      refund: 'İade'
    };
    return labels[type] || type;
  };

  return (
    <div className="wallet-page">
      <h1>Cüzdan</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="wallet-balance-card">
        <div className="balance-header">
          <h2>Bakiye</h2>
          <button
            className="topup-btn"
            onClick={() => setShowTopup(!showTopup)}
          >
            Para Yükle
          </button>
        </div>
        <div className="balance-amount">
          {wallet ? (
            <>
              <span className="amount">{wallet.balance.toFixed(2)}</span>
              <span className="currency">{wallet.currency}</span>
            </>
          ) : (
            <span className="loading">Yükleniyor...</span>
          )}
        </div>
        {wallet && !wallet.is_active && (
          <div className="inactive-warning">
            Cüzdanınız aktif değil. Lütfen yönetici ile iletişime geçin.
          </div>
        )}
      </div>

      {showTopup && (
        <div className="topup-section">
          <h3>Para Yükle</h3>
          <div className="topup-form">
            <label>
              Tutar (TRY):
              <input
                type="number"
                min="50"
                step="0.01"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Minimum 50 TRY"
              />
            </label>
            <div className="topup-actions">
              <button onClick={handleTopup} className="confirm-topup-btn">
                Ödeme Sayfasına Git
              </button>
              <button
                onClick={() => {
                  setShowTopup(false);
                  setTopupAmount('');
                }}
                className="cancel-topup-btn"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="transactions-section">
        <h2>İşlem Geçmişi</h2>
        {loading ? (
          <div className="loading">Yükleniyor...</div>
        ) : (
          <>
            {transactions.length === 0 ? (
              <div className="no-transactions">İşlem geçmişi bulunmamaktadır.</div>
            ) : (
              <>
                <div className="transactions-list">
                  {transactions.map(transaction => (
                    <div
                      key={transaction.id}
                      className={`transaction-item ${getTransactionTypeClass(transaction.type)}`}
                    >
                      <div className="transaction-main">
                        <div className="transaction-type">
                          {getTransactionTypeLabel(transaction.type)}
                        </div>
                        <div className="transaction-amount">
                          {transaction.type === 'credit' ? '+' : '-'}
                          {transaction.amount.toFixed(2)} {transaction.wallet?.currency || 'TRY'}
                        </div>
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-reference">
                          {getReferenceTypeLabel(transaction.reference_type)}
                        </div>
                        {transaction.description && (
                          <div className="transaction-description">
                            {transaction.description}
                          </div>
                        )}
                        <div className="transaction-date">
                          {new Date(transaction.created_at).toLocaleString('tr-TR')}
                        </div>
                        <div className="transaction-balance">
                          Bakiye: {transaction.balance_after.toFixed(2)} TRY
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Önceki
                    </button>
                    <span>
                      Sayfa {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Sonraki
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalletPage;


