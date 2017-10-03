package com.example.chase.dontpaniceducational;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;

public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
    }

    public void cancelButtonClick(View view) {
        finish();
    }

    public void loginButtonClick(View view) {
        EditText loginUsername = (EditText) findViewById(R.id.editText_login);
        EditText loginPassword = (EditText) findViewById(R.id.editText_passwordLogin);
        String username = loginUsername.toString();
        String password = loginPassword.toString();
    }
}
