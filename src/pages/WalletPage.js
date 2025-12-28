import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTranslation } from '../hooks/useTranslation';
import './WalletPage.css';

const WalletPage = () => {
  const { t, language } = useTranslation();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWallet = useCallback(async () => {
    try {
      const response = await api.get('/wallet/balance');
      setWallet(response.data.data);
      setError('');
    } catch (err) {
      setError(language === 'en' ? 'Failed to load wallet information.' : 'Cüzdan bilgileri yüklenemedi.');
      console.error('Error fetching wallet:', err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await api.get('/wallet/transactions', {
        params: { page, limit: 20 }
      });
      setTransactions(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setError('');
    } catch (err) {
      console.error('Error fetching transactions:', err);
      // Don't set error for transactions, just log it
    }
  }, [page]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchWallet();
        await fetchTransactions();
      } catch (err) {
        console.error('Error loading wallet data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchWallet, fetchTransactions]);

  const handleTopup = async () => {
    if (!topupAmount || parseFloat(topupAmount) < 50) {
      alert(language === 'en' ? 'Minimum top-up amount is 50 TRY.' : 'Minimum yükleme tutarı 50 TRY\'dir.');
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
        alert(language === 'en' ? 'Payment page could not be created.' : 'Ödeme sayfası oluşturulamadı.');
      }
    } catch (err) {
      alert(err.response?.data?.error || (language === 'en' ? 'Failed to start top-up.' : 'Para yükleme başlatılamadı.'));
    }
  };

  const getTransactionTypeLabel = (type) => {
    return type === 'credit' ? (language === 'en' ? 'Top-up' : 'Yükleme') : (language === 'en' ? 'Expense' : 'Harcama');
  };

  const getTransactionTypeClass = (type) => {
    return type === 'credit' ? 'transaction-credit' : 'transaction-debit';
  };

  const getReferenceTypeLabel = (type) => {
    const labels = {
      topup: language === 'en' ? 'Top-up' : 'Para Yükleme',
      meal_reservation: language === 'en' ? 'Meal Reservation' : 'Yemek Rezervasyonu',
      event_registration: language === 'en' ? 'Event Registration' : 'Etkinlik Kaydı',
      refund: t('wallet.refund')
    };
    return labels[type] || type;
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <main>
        <div className="wallet-page">
          <h1>{t('wallet.title')}</h1>

          {error && <div className="error-message">{error}</div>}

          <div className="wallet-balance-card">
            <div className="balance-header">
              <h2>{t('wallet.balance')}</h2>
              <button
                className="topup-btn"
                onClick={() => setShowTopup(!showTopup)}
              >
                {t('wallet.addFunds')}
              </button>
            </div>
            <div className="balance-amount">
              {wallet ? (
                <>
                  <span className="amount">{typeof wallet.balance === 'number' ? wallet.balance.toFixed(2) : (parseFloat(wallet.balance) || 0).toFixed(2)}</span>
                  <span className="currency">{wallet.currency || 'TRY'}</span>
                </>
              ) : (
                <span className="loading">{t('common.loading')}</span>
              )}
            </div>
            {wallet && !wallet.is_active && (
              <div className="inactive-warning">
                {language === 'en' ? 'Your wallet is not active. Please contact an administrator.' : 'Cüzdanınız aktif değil. Lütfen yönetici ile iletişime geçin.'}
              </div>
            )}
          </div>

          {showTopup && (
            <div className="topup-section">
              <h3>{t('wallet.addFunds')}</h3>
              <div className="topup-form">
                <label>
                  {t('wallet.amount')} (TRY):
                  <input
                    type="number"
                    min="50"
                    step="0.01"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder={language === 'en' ? 'Minimum 50 TRY' : 'Minimum 50 TRY'}
                  />
                </label>
                <div className="topup-actions">
                  <button onClick={handleTopup} className="confirm-topup-btn">
                    {language === 'en' ? 'Go to Payment Page' : 'Ödeme Sayfasına Git'}
                  </button>
                  <button
                    onClick={() => {
                      setShowTopup(false);
                      setTopupAmount('');
                    }}
                    className="cancel-topup-btn"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="transactions-section">
            <h2>{t('wallet.transactions')}</h2>
            {loading ? (
              <div className="loading">{t('common.loading')}</div>
            ) : (
              <>
                {transactions.length === 0 ? (
                  <div className="no-transactions">{t('wallet.noTransactions')}</div>
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
                              {(typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount) || 0).toFixed(2)} {transaction.wallet?.currency || 'TRY'}
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
                              {new Date(transaction.created_at).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR')}
                            </div>
                            <div className="transaction-balance">
                              {t('wallet.balance')}: {(typeof transaction.balance_after === 'number' ? transaction.balance_after : parseFloat(transaction.balance_after) || 0).toFixed(2)} TRY
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
                          {t('common.back')}
                        </button>
                        <span>
                          {language === 'en' ? 'Page' : 'Sayfa'} {page} / {totalPages}
                        </span>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          {t('common.next')}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WalletPage;


