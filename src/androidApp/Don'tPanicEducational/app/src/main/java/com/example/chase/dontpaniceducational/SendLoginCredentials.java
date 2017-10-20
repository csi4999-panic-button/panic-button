package com.example.chase.dontpaniceducational;

import android.os.AsyncTask;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

public abstract class SendLoginCredentials extends AsyncTask<URL, Integer, Long> {
    protected void doInBackground() {
        try {
            URL apiEndpoint = new URL("http://www.panic-button.stream");
            HttpURLConnection myConnection = (HttpURLConnection) apiEndpoint.openConnection();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    protected void onProgressUpdate() {

    }

    protected void onPostExecute() {

    }
}
