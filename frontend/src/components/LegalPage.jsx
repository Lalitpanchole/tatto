import React from 'react';

export default function LegalPage({ title }) {
  if (title === 'Terms & Conditions') {
    return (
      <div className="bg-white min-h-screen pt-4 pb-16 px-6 font-sans text-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[40px] font-black uppercase tracking-tighter mb-8">Terms of Conditions</h1>
          <div className="prose prose-zinc max-w-none prose-p:text-sm prose-p:leading-relaxed prose-p:text-zinc-600 prose-headings:font-bold prose-headings:tracking-widest">
            <p>Re: Workspace including furnishings and ancillary rooms</p>
            <p>consisting of</p>
            <p>a visually separated workspace within the commercial premises, equipped for tattooing, and</p>
            <p>ancillary rooms (shared restrooms on the same floor)</p>
            <p>hereinafter referred to as the "Property of Use"</p>
            <p>located at<br/>Aargauerstrasse 180, 8048 Zurich.</p>
            
            <h2 className="text-lg mt-8 mb-4">I. Preamble</h2>
            <p>
              The operator provides the user with a permanently assigned workspace including furnishings and ensures its proper functioning. In addition, the operator provides the user with a sink and a toilet for general (non-exclusive) use. The toilet is located on the same floor outside the commercial premises and is used by all tenants on the same floor. This framework agreement is limited solely to the provision of these premises, which must be handled with care in all cases. The operator has no authority over the user in connection with the tattooing process. In particular, the user determines when and how they perform a tattoo, and bears sole responsibility for this. Furthermore, it is the user's responsibility to acquire clients, determine their pricing, and set their own working hours. The operator has no authority to issue instructions in this regard.
            </p>

            <h2 className="text-lg mt-8 mb-4">II. Subject Matter of the Agreement</h2>
            <p>(1)</p>
            <p>
              This agreement is structured as a framework agreement and forms the basis for the individual user agreements concluded via the operator's online tool (www.tattooplatz.ch). The framework agreement therefore governs the fundamental terms and conditions between the operator and the user. This agreement does not create any entitlement for the user to use a workspace.
            </p>

            <h2 className="text-lg mt-8 mb-4">III. Duration of Use</h2>
            <p>(2)</p>
            <p>
              The duration of use is limited and ends automatically, without any action required by either party, depending on the duration booked on the operator's online tool (www.tattooplatz.ch). A tacit continuation of the agreement is excluded, although the user is free to book or arrange further time slots via the operator's online tool, provided spaces are available.
            </p>

            <h2 className="text-lg mt-8 mb-4">IV. Usage Fee</h2>
            <h3 className="font-bold mt-4 mb-2">A. Amount of the Usage Fee</h3>
            <p>(3)</p>
            <p>
              The fee for the use of a workspace and ancillary rooms is determined according to the price list, including cancellation fees, posted on the operator's website (www.tattooplatz.ch).
            </p>
            <p>(4)</p>
            <p>
              No additional fees (e.g., heating, electricity, waste disposal costs, internet) will be charged. Any claims arising from improper or careless use of the provided equipment, the commercial space including the workspace, and ancillary rooms are reserved.
            </p>

            <h3 className="font-bold mt-4 mb-2">B. Due Date</h3>
            <p>(5)</p>
            <p>
              The total usage fee is payable in advance. Payment is processed via the online tool on the operator's website (www.tattooplatz.ch).
            </p>

            <h2 className="text-lg mt-8 mb-4">V. Use of the Workspace and Ancillary Rooms</h2>
            <p>(6)</p>
            <p>
              The workspace provided on the operator's premises, including its facilities and ancillary rooms, must be used appropriately and carefully. Use is limited to tattooing. The provision or sale of any other services is prohibited. Furthermore, the user must be considerate of other users in the same premises and of all tenants of the entire property when using the workspace and ancillary rooms, and must adhere to the house rules. The user is also obligated to observe the studio's opening hours and to leave the premises after closing time.
            </p>

            <h2 className="text-lg mt-8 mb-4">VI. Maintenance and Upkeep of the Premises</h2>
            <p>(7)</p>
            <p>
              The user is obligated to treat the workspace and all premises with care and to maintain them in a usable and suitable condition. The user is responsible to the operator for any damage caused to the entire property as well as to valuables belonging to other users on the premises and is obligated to repair any damage immediately, provided the damage was caused by them, their customers and their companions, or their employees. The user shall indemnify the operator in this regard. The user waives the right to assert claims for damages against the operator if, in the event of
            </p>
          </div>
        </div>
      </div>
    );
  } else if (title === 'Privacy Policy') {
    return (
      <div className="bg-white min-h-screen pt-4 pb-16 px-6 font-sans text-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[40px] font-black uppercase tracking-tighter mb-8">Privacy Policy</h1>
          <div className="prose prose-zinc max-w-none prose-p:text-sm prose-p:leading-relaxed prose-p:text-zinc-600 prose-headings:font-bold prose-headings:tracking-widest">
            <h2 className="text-lg mt-8 mb-4">Data Privacy</h2>
            <p>
              This is a privacy policy. Data privacy is an important part of any website. This template contains sample text, is not final, and cannot be published. Depending on the features of your website, the wording of your privacy policy will vary. Therefore, adapt this text accordingly. A privacy policy must list all third-party components that you use on your website. Ensure that the link to the privacy policy is accessible from every page of the website.
            </p>
            <h2 className="text-lg mt-8 mb-4">Sample Content</h2>
            <h3 className="font-bold mt-4 mb-2">Data Collection, Use, and Sharing</h3>
            <p>
              Explanation of the ownership of information collected on your website, the type of data collected, sharing with third parties, etc.
            </p>
            <h3 className="font-bold mt-4 mb-2">Data Control</h3>
            <p>
              Explanation of the ability to view, modify, and update personal information and data, concerns regarding data use, etc.
            </p>
            <h3 className="font-bold mt-4 mb-2">Data Security</h3>
            <p>
              Protection measures for user data, data encryption, server information where data is stored, data transfer, etc.
            </p>
          </div>
        </div>
      </div>
    );
  } else if (title === 'Impressum') {
    return (
      <div className="bg-white min-h-screen pt-4 pb-16 px-6 font-sans text-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[40px] font-black uppercase tracking-tighter mb-8">Impressum</h1>
          <div className="prose prose-zinc max-w-none prose-p:text-sm prose-p:leading-relaxed prose-p:text-zinc-600 prose-headings:font-bold prose-headings:tracking-widest">
            <h2 className="text-lg mt-8 mb-4">Tattooplatz Impressum</h2>
            <p>
              <strong>Tattooplatz GmbH</strong><br/>
              Aargauerstrasse 180, 8048 Zurich<br/>
              hello@tattooplatz.ch<br/>
              www.tattooplatz.ch
            </p>
            <p>
              <strong>Authorized Managing Director:</strong> Tattooplatz GmbH<br/>
              <strong>CHE:</strong> 369.538.191<br/>
              <strong>Commercial Register No.:</strong> CH-020.4.079.532-1<br/>
              <strong>Register Court:</strong> Zurich, Switzerland
            </p>
          </div>
        </div>
      </div>
    );
  } else if (title === 'Cancellation Policy') {
    return (
      <div className="bg-white min-h-screen pt-4 pb-16 px-6 font-sans text-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[40px] font-black uppercase tracking-tighter mb-8">Cancellation Policy</h1>
          <div className="prose prose-zinc max-w-none prose-p:text-sm prose-p:leading-relaxed prose-p:text-zinc-600 prose-headings:font-bold prose-headings:tracking-widest">
            <p>
              Bookings can only be changed or canceled free of charge 72 hours before the start of the booking.
            </p>
            <p className="mt-[2px]">
              If an appointment is missed without prior notice, we reserve the right to charge the full amount.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-4 pb-16 px-6 font-sans text-black">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-[40px] font-black uppercase tracking-tighter mb-8">{title}</h1>
        <div className="prose prose-zinc max-w-none prose-p:text-sm prose-p:leading-relaxed prose-p:text-zinc-600 prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-widest">
          <p>
            Welcome to the {title} page. 
            This is placeholder content for {title}. Final legal content will be provided by the legal team.
          </p>
          <h2 className="text-lg mt-8 mb-4">1. General Information</h2>
          <p>
            Tattooplatz GmbH provides this platform to facilitate coworking space rentals. By accessing our services, you agree to comply with our policies.
          </p>
          <h2 className="text-lg mt-8 mb-4">2. Usage Rights</h2>
          <p>
            All content on this website belongs to Tattooplatz GmbH unless otherwise stated. Reproduction without consent is strictly prohibited.
          </p>
          <h2 className="text-lg mt-8 mb-4">3. Amendments</h2>
          <p>
            We reserve the right to modify these policies at any time. Changes will be communicated through our platform. 
          </p>
        </div>
      </div>
    </div>
  );
}
