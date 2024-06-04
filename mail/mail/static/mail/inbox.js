
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send email
  document.querySelector('#compose-form').addEventListener('submit', send_email);
}

function reply_email(id) {
  console.log("reply");
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send email
  document.querySelector('#compose-form').addEventListener('submit', send_email);
}

// Send Email Function
function send_email() {
  // Get the data
  const recipents = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  
  // save data to email object
  fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: recipents,
      subject: subject,
      body: body,
      read: false
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
  });
  }

// Display mail Function
  function display_mail(id, mailbox) {
    // Hide other div elements
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    
    // Show the mail-view DIV
    document.querySelector('#mail-view').innerHTML = '';
    document.querySelector('#mail-view').style.display = 'block';
    // Get the mail data JSON
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      const element = document.createElement('div');
      element.className = "email-open";
      element.style = "text-align: left";
      // Display email content
      element.innerHTML = `
        <hr>
        <h6>From: ${email.sender}</b></h6>
        <h6>Recipients: ${email.recipients} </h6>
        <h6>Subject: ${email.subject}</h6>
        <h6>Time: ${email.timestamp}</h6>
        <hr> 
        <pre style="font-family: Arial"><p>${email.body}</p></pre>
        `;
      // Set the Read to True
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      document.querySelector('#mail-view').append(element);
      
      if(mailbox !== 'sent') // Hide the button to the sent page
      {
        // Set mail Archive status
        const archive_btn = document.createElement('button');
        archive_btn.innerHTML= !email.archived ? "Archive" : "Unarchive";
        archive_btn.className = !email.archived ? "btn btn-success" : "btn btn-warning";
        archive_btn.addEventListener('click', function() {
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email.archived // Set the status to the opposte value
            })
          })
          .then( () => {load_mailbox('inbox')});
        });
        document.querySelector('#mail-view').append(archive_btn);
  
        // Reply Button
        if (!email.archived){
          const reply_btn = document.createElement('button');
          reply_btn.innerHTML= "Reply";
          reply_btn.className = "btn btn-info";
          reply_btn.style.margin = "8px";
          reply_btn.addEventListener('click', function() {
            console.log("this");
            document.querySelector('#mail-view').innerHTML='';
            compose_email();
            // Insert Value
            document.querySelector('#compose-recipients').value = email.sender;
            const subject = email.subject;
            if(subject.split(" ", 1) == 'Re:') {
              document.querySelector('#compose-subject').value = subject;
            }
            else {
              document.querySelector('#compose-subject').value = 'Re: '+ subject;
            }
            document.querySelector('#compose-body').value = ` On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
          });
          document.querySelector('#mail-view').append(reply_btn);
        }
      }
    });
  }

// Load Mailbox
function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  //document.querySelector('#set-unarchive').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // get
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // loop for every mail
    emails.forEach(email => {
      const element = document.createElement('div');
      element.className = "unread-email";
      // Display List of emails
      element.innerHTML = `
                          <h4>Sender: ${email.sender} </h4>
                          <p>Subject: ${email.subject} </p>
                          <h6>Time: ${email.timestamp} </h6>
                          
                          `;
      // If an email is read change the class name 
      if (email.read) {
        element.classList.add("read-email");
        element.classList.remove("unread-email");
      }
      // If an email is clicked display the email
      element.addEventListener('click', function() {
      display_mail(email.id,mailbox);
      });
      //add the element to div
      document.querySelector('#emails-view').append(element);
    })
    // ... do something else with emails ...
  });
}
