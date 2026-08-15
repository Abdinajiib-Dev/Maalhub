import React from 'react';

const TermsContent = () => {
  return (
    <div className="space-y-6 text-gray-600">
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h2>
        <p>
          By accessing and using MaalHub, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our platform.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. User Accounts</h2>
        <p>
          To use certain features of the platform, you must register for an account. You agree to provide accurate information and keep it updated. You are responsible for safeguarding your password and any activities under your account.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Entrepreneur and Investor Responsibilities</h2>
        <p>
          Entrepreneurs are responsible for the accuracy of their project details. Investors must conduct their own due diligence before making any investment decisions. MaalHub is a facilitator and does not guarantee the success or return of any investment.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Intellectual Property</h2>
        <p>
          The platform and its original content are owned by MaalHub and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Limitation of Liability</h2>
        <p>
          MaalHub shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your access to or use of, or inability to access or use the platform.
        </p>
      </section>

      <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default TermsContent;
