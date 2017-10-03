package com.example.chase.dontpaniceducational;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

public class LoginActivity extends AppCompatActivity {
    private EditText loginUsername, loginPassword;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        loginUsername = (EditText) findViewById(R.id.editText_login);
        loginPassword = (EditText) findViewById(R.id.editText_passwordLogin);
    }

    public void clearFieldsLogin(View view) {
        loginUsername.setText("");
        loginPassword.setText("");
    }

    public void loginButtonClick(View view) {
        String username = loginUsername.getText().toString();
        String password = loginPassword.getText().toString();
        if (username.matches("") || password.matches("")) {
            Toast.makeText(this, "You cannot continue because one of the fields is empty.", Toast.LENGTH_SHORT).show();
            return;
        }
        Intent intent = new Intent(this, PanicActivity.class);
        startActivity(intent);
    }
}
