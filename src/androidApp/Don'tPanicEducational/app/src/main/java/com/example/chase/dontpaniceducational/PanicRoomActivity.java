package com.example.chase.dontpaniceducational;

import android.content.SharedPreferences;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import java.net.URISyntaxException;

public class PanicRoomActivity extends AppCompatActivity {
    private TextView numberOfPanicStudents;
    private Socket panicSocket;
    private SharedPreferences mySharedPreferences;
    public static String MY_PREFS = "MY_PREFS";
    int prefMode = JoinClassActivity.MODE_PRIVATE;
    private String classroom;
    private String[] emitMessage = new String[2];

    {
        try {
            panicSocket = IO.socket("http://www.panic-button.stream");
        } catch(URISyntaxException e){}
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_panic_room);
        mySharedPreferences = getSharedPreferences(MY_PREFS, prefMode);
        classroom = mySharedPreferences.getString("classroom", null);
        emitMessage[0] = classroom;
        emitMessage[1] = "true";
        numberOfPanicStudents = (TextView) findViewById(R.id.textView_numberOfPanickedStudents);
        panicSocket.connect();
    }

    public void panicButtonClick(View view) {
        panicSocket.emit("panic", emitMessage);
    }
}
