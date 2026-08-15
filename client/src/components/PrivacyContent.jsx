import React from 'react';

const PrivacyContent = () => {
  return (
    <div className="space-y-6 text-gray-600">
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, and other information you choose to provide.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. How We Use Your Information</h2>
        <p>
          We may use the information we collect about you to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Provide, maintain, and improve our platform;</li>
          <li>Perform internal operations, including troubleshooting, data analysis, testing, and research;</li>
          <li>Send you communications we think will be of interest to you;</li>
          <li>Personalize and improve the platform.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Sharing of Information</h2>
        <p>
          We do not share your personal information with third parties except as described in this privacy policy, such as with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Security</h2>
        <p>
          We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
        </p>
      </section>

      <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default PrivacyContent;
