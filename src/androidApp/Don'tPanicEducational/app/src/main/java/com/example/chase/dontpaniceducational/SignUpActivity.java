package com.example.chase.dontpaniceducational;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;

public class SignUpActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sign_up);
    }

    EditText signUpFirstName = (EditText) findViewById(R.id.editText_firstNameSignUp);
    EditText signUpLastName = (EditText) findViewById(R.id.editText_lastNameSignUp);
    EditText signUpEmail = (EditText) findViewById(R.id.editText_emailAddressSignUp);
    EditText signUpPassword = (EditText) findViewById(R.id.editText_passwordSignUp);

    public void userInfo(View view) {
        String stringFirstName = signUpFirstName.toString();
        String stringLastName = signUpLastName.toString();
        String stringEmailAddress = signUpEmail.toString();
        String stringPassword = signUpPassword.toString();
    }

    public void clearFields(View view) {
        signUpFirstName.setText("");
        signUpLastName.setText("");
        signUpEmail.setText("");
        signUpPassword.setText("");
    }
}
