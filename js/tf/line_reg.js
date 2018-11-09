class LinearRegression {
    constructor() {
        this.a = tf.variable(tf.scalar(Math.random()));
        this.b = tf.variable(tf.scalar(Math.random()));
        this.c = tf.variable(tf.scalar(Math.random()));
    }

    predict(x) {
        return tf.tidy(()=> {
            return this.a.mul(x.pow(tf.scalar(2)))
                    .add(this.b.mul(x))
                    .add(this.c);
        });
    }

    loss(predictions,lables) {
        return predictions.sub(lables).square().mean();
    }

    train(x,y,number) {
        const learnRate = 0.5;
        const optimizer =  tf.train.sgd(learnRate);
        for(let i = 0;i < number; i ++) {
            optimizer.minimize(()=> {
                const pred =  this.predict(y);
                return loss(pred,y);
            });
        }
    }
}